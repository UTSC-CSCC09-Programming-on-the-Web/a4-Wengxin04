export function render(container) {
  container.innerHTML = `
    <header class="row gallery-header">
      <div class="col-12 header-content">
        <h1 class="site-title" id="galleryTitle">🌆 Web Gallery</h1>
        <a href="#home" class="btn">Home</a>
        <button
          id="toggleFormBtn"
          class="toggle-form-btn hidden"
          aria-label="Add Image"
        ></button>
      </div>
    </header>

    <section id="addImageContainer" class="add-image-section row">
      <div class="col-12">
        <form id="addImageForm" class="form hidden">
          <h2>Add Image</h2>
          <input
            type="text"
            name="title"
            placeholder="Image Title"
            required
            class="form-input input"
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            class="form-input input"
          />
          <div id="addImageLoading" class="hidden">Uploading...</div>
          <div id="addImageError" class="hidden">
            Failed to upload image. Please try again.
          </div>
          <button type="submit" class="btn form-button">Submit</button>
        </form>
      </div>
    </section>

    <section class="gallery-app row">
      <div id="imageGallery" class="image-gallery col-12 center-mode">
        <img
          id="prevArrow"
          class="gallery-nav-btn hidden"
          src="static/media/button-left.png"
          alt="Previous"
        />
        <div id="prevThumb" class="gallery-thumb"></div>
        <div id="currentImageDisplay" class="gallery-main"></div>
        <div id="nextThumb" class="gallery-thumb"></div>
        <img
          id="nextArrow"
          class="gallery-nav-btn hidden"
          src="static/media/button-right.png"
          alt="Next"
        />
      </div>

      <div id="loadingMessage" class="hidden">Loading images...</div>
      <div id="errorMessage" class="hidden">
        An error occurred while loading images. Please try again later.
      </div>
      <div id="emptyMessage" class="hidden"></div>

      <div id="imageCounter" class="image-counter gallery-counter"></div>
    </section>

    <div class="modal" id="imageModal">
      <div class="modal-content row">
        <span id="closeModal" class="close-btn">&times;</span>

        <div class="col-6 col-sm-12 image-display-section">
          <div class="image-info">
            <img id="modalImage" src="" alt="Image" class="modal-img" />
            <p><strong>Title:</strong> <span id="modalImageTitle"></span></p>
            <p><strong>Author:</strong> <span id="modalImageAuthor"></span></p>
          </div>
          <div id="modalLoadingMessage" class="hidden">Loading...</div>
          <div id="modalErrorMessage" class="hidden">Failed to load image.</div>
          <div class="image-controls">
            <div class="pagination-buttons">
              <button id="prevImageBtn" class="btn">Previous</button>
              <span id="modalImageCounter" class="modal-image-counter"></span>
              <button id="nextImageBtn" class="btn">Next</button>
            </div>
            <div id="deleteImageLoading" class="hidden">Deleting image...</div>
            <div id="deleteImageError" class="error hidden">
              Failed to delete image
            </div>
            <button id="deleteImageBtn" class="btn delete-btn">Delete</button>
          </div>
        </div>

        <div id="commentSection" class="col-6 col-sm-12 comment-section">
          <h2>Comments</h2>
          <div id="loginToViewComments" class="comment-login-message hidden">
            Please <a href="#login">sign in</a> to view and post comments.
          </div>
          <form id="commentForm" class="comment-form form">
            <input
              type="text"
              name="content"
              placeholder="Your Comment"
              required
              class="form-input input"
            />
            <button type="submit" class="btn form-button">Add Comment</button>
          </form>
          <ul id="commentsList" class="comment-list"></ul>
          <div id="commentsLoading" class="hidden">Loading comments...</div>
          <div id="commentsError" class="hidden">Failed to load comments.</div>
          <div id="commentsEmpty" class="hidden">No comments yet.</div>
          <div class="comment-controls">
            <button id="prevCommentsBtn" class="btn" disabled>Previous</button>
            <button id="nextCommentsBtn" class="btn" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function init(container) {
  const [imagePage, getImagePage, setImagePage] = meact.useState(0);
  const [mainImage, getMainImage, setMainImage] = meact.useState(null);
  const [prevThumb, getPrevThumb, setPrevThumb] = meact.useState(null);
  const [nextThumb, getNextThumb, setNextThumb] = meact.useState(null);
  const [imageCount, getImageCount, setImageCount] = meact.useState(0);

  const [, getActiveImageId, setActiveImageId] = meact.useState(null);
  const [, getModalPage, setModalPage] = meact.useState(null);

  const [comments, getComments, setComments] = meact.useState([]);
  const [commentPage, getCommentPage, setCommentPage] = meact.useState(0);
  const [commentTotal, getCommentTotal, setCommentTotal] = meact.useState(0);

  const [, getIsLoading, setIsLoading] = meact.useState(false);
  const [, getHasError, setHasError] = meact.useState(false);
  const [, , setCommentsLoading] = meact.useState(false);
  const [, , setCommentsError] = meact.useState(false);
  const [, , setAddImageLoading] = meact.useState(false);
  const [, , setAddImageError] = meact.useState(false);
  const [, , setDeleteImageLoading] = meact.useState(false);
  const [, , setDeleteImageError] = meact.useState(false);

  const COMMENTS_PER_PAGE = 10;
  let currentUser = null;
  let isOwner = false;

  const params = new URLSearchParams(location.hash.split("?")[1]);
  const galleryId = params.get("id");

  const dom = {
    galleryEl: container.querySelector("#imageGallery"),
    emptyEl: container.querySelector("#emptyMessage"),
    loadingEl: container.querySelector("#loadingMessage"),
    errorEl: container.querySelector("#errorMessage"),
    modalLoadingEl: container.querySelector("#modalLoadingMessage"),
    modalErrorEl: container.querySelector("#modalErrorMessage"),
    commentsLoadingEl: container.querySelector("#commentsLoading"),
    commentsErrorEl: container.querySelector("#commentsError"),
    commentsEmptyEl: container.querySelector("#commentsEmpty"),
    addImageLoadingEl: container.querySelector("#addImageLoading"),
    addImageErrorEl: container.querySelector("#addImageError"),
    counterEl: container.querySelector("#imageCounter"),
    prevThumb: container.querySelector("#prevThumb"),
    nextThumb: container.querySelector("#nextThumb"),
    mainDisplay: container.querySelector("#currentImageDisplay"),
    prevArrow: container.querySelector("#prevArrow"),
    nextArrow: container.querySelector("#nextArrow"),
    modal: container.querySelector("#imageModal"),
    modalImage: container.querySelector("#modalImage"),
    modalImageTitle: container.querySelector("#modalImageTitle"),
    modalImageAuthor: container.querySelector("#modalImageAuthor"),
    modalImageCounter: container.querySelector("#modalImageCounter"),
    prevImageBtn: container.querySelector("#prevImageBtn"),
    nextImageBtn: container.querySelector("#nextImageBtn"),
    closeModal: container.querySelector("#closeModal"),
    toggleFormBtn: container.querySelector("#toggleFormBtn"),
    addImageForm: container.querySelector("#addImageForm"),
    commentForm: container.querySelector("#commentForm"),
    commentsList: container.querySelector("#commentsList"),
    prevCommentsBtn: container.querySelector("#prevCommentsBtn"),
    nextCommentsBtn: container.querySelector("#nextCommentsBtn"),
    deleteImageBtn: container.querySelector("#deleteImageBtn"),
  };

  function setupUserAccessControls(user) {
    const isLoggedIn = !!user;

    container
      .querySelector("#loginToViewComments")
      .classList.toggle("hidden", isLoggedIn);
    container
      .querySelector("#commentForm")
      .classList.toggle("hidden", !isLoggedIn);
    container
      .querySelector("#commentsList")
      .classList.toggle("hidden", !isLoggedIn);
    container
      .querySelector("#prevCommentsBtn")
      .classList.toggle("hidden", !isLoggedIn);
    container
      .querySelector("#nextCommentsBtn")
      .classList.toggle("hidden", !isLoggedIn);

    if (isLoggedIn) {
      meact.useEffect(() => {
        renderComments();
      }, [comments, commentPage, commentTotal]);
    }
  }

  function updateStatusDisplay() {
    const loading = getIsLoading();
    const error = getHasError();
    const empty = getImageCount() === 0 && !loading && !error;
    const showGallery = !loading && !error && !empty;

    dom.loadingEl.classList.toggle("hidden", !loading);
    dom.errorEl.classList.toggle("hidden", !error);
    dom.emptyEl.classList.toggle("hidden", !empty);
    dom.galleryEl.classList.toggle("hidden", !showGallery);
    dom.counterEl.classList.toggle("hidden", !showGallery);

    if (empty) {
      dom.emptyEl.textContent = isOwner
        ? "No images yet. Use the ➕ button above to add one!"
        : "This gallery is empty.";
    }
  }

  function createThumbImage(image, onClick) {
    const img = document.createElement("img");
    img.src = `/api/images/${image.id}/file`;
    img.alt = image.title;
    img.classList.add("gallery-img");
    img.addEventListener("click", onClick);
    return img;
  }

  function renderGallery() {
    const total = getImageCount();
    const page = getImagePage();
    const mainImg = getMainImage();
    const prevImg = getPrevThumb();
    const nextImg = getNextThumb();

    updateStatusDisplay();

    if (total === 0 || !mainImg) {
      dom.prevArrow.classList.add("hidden");
      dom.nextArrow.classList.add("hidden");
      dom.prevThumb.innerHTML = "";
      dom.nextThumb.innerHTML = "";
      dom.mainDisplay.innerHTML = "";
      return;
    }

    dom.prevArrow.classList.toggle("hidden", page === 0);
    dom.nextArrow.classList.toggle("hidden", page >= total - 1);

    dom.prevThumb.innerHTML = "";
    dom.nextThumb.innerHTML = "";
    dom.mainDisplay.innerHTML = "";

    if (prevImg) {
      const prevEl = createThumbImage(prevImg, () => {
        if (page > 0) loadImages(page - 1);
      });
      prevEl.classList.add("gallery-thumb-img");
      dom.prevThumb.appendChild(prevEl);
    }

    if (mainImg) {
      const mainEl = createThumbImage(mainImg, () => renderModal(mainImg.id));
      mainEl.classList.add("gallery-main-img");
      dom.mainDisplay.appendChild(mainEl);
      setActiveImageId(mainImg.id);
    }

    if (nextImg) {
      const nextEl = createThumbImage(nextImg, () => {
        if (page < total - 1) loadImages(page + 1);
      });
      nextEl.classList.add("gallery-thumb-img");
      dom.nextThumb.appendChild(nextEl);
    }

    dom.counterEl.textContent = `${page + 1} of ${total}`;
  }

  function renderModal(imageId) {
    dom.modalLoadingEl.classList.remove("hidden");
    dom.modalErrorEl.classList.add("hidden");

    apiService
      .getImage(imageId)
      .then((image) => {
        apiService
          .getImageIndex(imageId)
          .then((index) => {
            const total = getImageCount();
            renderModalImage(image, index, total);
          })
          .catch(() => {
            dom.modalImageCounter.textContent = `? of ${getImageCount()}`;
            dom.prevImageBtn.disabled = true;
            dom.nextImageBtn.disabled = true;
            dom.modalErrorEl.classList.remove("hidden");
          });
      })
      .catch(() => {
        dom.modalErrorEl.classList.remove("hidden");
      })
      .finally(() => {
        dom.modalLoadingEl.classList.add("hidden");
      });
  }

  function renderModalImage(image, index, total) {
    if (isOwner) {
      dom.deleteImageBtn.classList.remove("hidden");
    } else {
      dom.deleteImageBtn.classList.add("hidden");
    }

    dom.modalImage.src = `/api/images/${image.id}/file`;
    dom.modalImageTitle.textContent = image.title;
    dom.modalImageAuthor.textContent = image.author;
    dom.modalImageCounter.textContent = `${index + 1} of ${total}`;
    dom.prevImageBtn.disabled = index === 0;
    dom.nextImageBtn.disabled = index >= total - 1;
    dom.modal.style.display = "flex";

    setModalPage(index);
    setActiveImageId(image.id);
    setCommentPage(0);
    loadComments(image.id, 0);
  }

  function renderComments() {
    dom.commentsList.innerHTML = "";
    const allComments = getComments();
    allComments.forEach((comment) => {
      const li = document.createElement("li");
      li.classList.add("comment-list-li");

      const canDelete =
        currentUser && (isOwner || currentUser.username === comment.author);

      li.innerHTML = `
        <div><strong>${comment.author}</strong> on ${new Date(
        comment.createdAt
      ).toLocaleString()}</div>
        <div>${comment.content}</div>
        ${
          canDelete
            ? `<button class="btn delete-comment-btn" data-id="${comment.id}">Delete</button>`
            : ""
        }
      `;
      dom.commentsList.appendChild(li);
    });

    const totalPages = Math.ceil(getCommentTotal() / COMMENTS_PER_PAGE);
    const currentPage = getCommentPage();
    dom.prevCommentsBtn.disabled = currentPage === 0;
    dom.nextCommentsBtn.disabled = currentPage >= totalPages - 1;
  }

  function loadImages(page) {
    setIsLoading(true);
    setHasError(false);
    updateStatusDisplay();

    apiService
      .getGalleryImageCount(galleryId)
      .then((count) => {
        setImageCount(count);
        if (count === 0) {
          setMainImage(null);
          setPrevThumb(null);
          setNextThumb(null);
          setIsLoading(false);
          updateStatusDisplay();
          return;
        }

        const main = apiService.getGalleryImages(galleryId, page, 1);
        const prev =
          page > 0
            ? apiService.getGalleryImages(galleryId, page - 1, 1)
            : Promise.resolve({ images: [null] });
        const next =
          page < count - 1
            ? apiService.getGalleryImages(galleryId, page + 1, 1)
            : Promise.resolve({ images: [null] });

        Promise.all([main, prev, next])
          .then(([mainData, prevData, nextData]) => {
            setMainImage(mainData.images[0] || null);
            setPrevThumb(prevData.images[0] || null);
            setNextThumb(nextData.images[0] || null);
            setImagePage(page);
            setIsLoading(false);
            renderGallery();
          })
          .catch(() => {
            setHasError(true);
            setIsLoading(false);
            updateStatusDisplay();
          });
      })
      .catch(() => {
        setHasError(true);
        setIsLoading(false);
        updateStatusDisplay();
      });
  }

  function loadComments(imageId, page) {
    if (!currentUser) return;
    setCommentsLoading(true);
    setCommentsError(false);

    apiService
      .getComments(imageId, page)
      .then((data) => {
        setComments(data.comments);
        setCommentTotal(data.totalCount);
        setCommentPage(page);
        setCommentsLoading(false);
        renderComments();
      })
      .catch(() => {
        setCommentsError(true);
        setCommentsLoading(false);
      });
  }

  function setupEventListeners() {
    dom.toggleFormBtn.addEventListener("click", () => {
      dom.addImageForm.classList.toggle("hidden");
    });

    dom.addImageForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const title = this.title.value;
      const author = currentUser.username;
      const file = this.image.files[0];

      setAddImageLoading(true);
      setAddImageError(false);

      apiService
        .addImage(title, author, file, galleryId)
        .then(() => {
          return apiService.getGalleryImageCount(galleryId).then((count) => {
            setImageCount(count);
            loadImages(0);
          });
        })
        .then(() => {
          this.reset();
          this.classList.add("hidden");
        })
        .catch(() => {
          setAddImageError(true);
        })
        .finally(() => {
          setAddImageLoading(false);
        });
    });

    dom.closeModal.addEventListener("click", () => {
      dom.modal.style.display = "none";
      const savedPage = getModalPage();
      if (savedPage !== null) {
        loadImages(savedPage);
        setModalPage(null);
      }
    });

    dom.commentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const author = currentUser.username;
      const content = this.content.value;
      const imageId = getActiveImageId();

      apiService
        .addComment(imageId, author, content)
        .then(() => {
          loadComments(imageId, 0);
          this.reset();
        })
        .catch(() => alert("Failed to add comment"));
    });

    dom.commentsList.addEventListener("click", function (e) {
      if (e.target.classList.contains("delete-comment-btn")) {
        const commentId = parseInt(e.target.dataset.id);
        const imageId = getActiveImageId();
        if (!imageId) return;

        apiService
          .deleteComment(commentId)
          .then(() => {
            loadComments(imageId, 0);
          })
          .catch(() => alert("Failed to delete comment"));
      }
    });

    dom.deleteImageBtn.addEventListener("click", () => {
      const imageId = getActiveImageId();
      if (!imageId) return;

      setDeleteImageLoading(true);
      setDeleteImageError(false);

      apiService
        .deleteImage(imageId)
        .then(() => {
          dom.modal.style.display = "none";
          return apiService.getGalleryImageCount(galleryId).then((count) => {
            setImageCount(count);
            let page = getModalPage();
            if (page > 0 && page >= count) page = count - 1;
            if (page < 0) page = 0;
            loadImages(page);
          });
        })
        .catch(() => {
          setDeleteImageError(true);
        })
        .finally(() => {
          setDeleteImageLoading(false);
        });
    });

    dom.prevImageBtn.addEventListener("click", () => {
      const page = getModalPage();
      if (page > 0) {
        apiService.getGalleryImages(galleryId, page - 1, 1).then((data) => {
          const image = data.images[0];
          if (image) {
            renderModalImage(image, page - 1, getImageCount());
          }
        });
      }
    });

    dom.nextImageBtn.addEventListener("click", () => {
      const page = getModalPage();
      const count = getImageCount();
      if (page < count - 1) {
        apiService.getGalleryImages(galleryId, page + 1, 1).then((data) => {
          const image = data.images[0];
          if (image) {
            renderModalImage(image, page + 1, count);
          }
        });
      }
    });

    dom.prevArrow.addEventListener("click", () => {
      const page = getImagePage();
      if (page > 0) {
        loadImages(page - 1);
      }
    });

    dom.nextArrow.addEventListener("click", () => {
      const page = getImagePage();
      const total = getImageCount();
      if (page < total - 1) {
        loadImages(page + 1);
      }
    });

    dom.prevCommentsBtn.addEventListener("click", () => {
      const currentPage = getCommentPage();
      const imageId = getActiveImageId();
      if (currentPage > 0 && imageId) {
        loadComments(imageId, currentPage - 1);
      }
    });

    dom.nextCommentsBtn.addEventListener("click", () => {
      const currentPage = getCommentPage();
      const totalPages = Math.ceil(getCommentTotal() / COMMENTS_PER_PAGE);
      const imageId = getActiveImageId();
      if (currentPage < totalPages - 1 && imageId) {
        loadComments(imageId, currentPage + 1);
      }
    });
  }

  const token = localStorage.getItem("token");
  const fetchUser = token
    ? apiService.getCurrentUser(token).catch(() => null)
    : Promise.resolve(null);

  fetchUser
    .then((user) => {
      currentUser = user;
      return apiService.getGallery(galleryId);
    })
    .then((gallery) => {
      isOwner = currentUser && currentUser.id === gallery.UserId;
      container.querySelector(
        "#galleryTitle"
      ).textContent = `🌆 ${gallery.name}`;
      container
        .querySelector("#toggleFormBtn")
        .classList.toggle("hidden", !isOwner);

      setupUserAccessControls(currentUser);
      setupEventListeners();
      loadImages(0);

      meact.useEffect(() => {
        renderGallery();
      }, [mainImage, prevThumb, nextThumb, imageCount, imagePage]);
    })
    .catch(() => {
      container.querySelector("#errorMessage").classList.remove("hidden");
      container.querySelector("#errorMessage").textContent =
        "Failed to load gallery.";
    });
}

export default { render, init };
