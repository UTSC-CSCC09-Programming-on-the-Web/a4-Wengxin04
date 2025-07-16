window.apiService = (function () {
  "use strict";
  let module = {};

  /* --------- Images -----------*/

  // add an image to the gallery
  module.addImage = function (title, author, image, galleryId) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("image", image);
    formData.append("GalleryId", galleryId);

    return fetch("/api/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    }).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to add image");
      }
      return res.json();
    });
  };

  // delete an image from the gallery given its imageId
  module.deleteImage = function (imageId) {
    return fetch(`/api/images/${imageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to delete image");
      }
      return res.json();
    });
  };

  // get the gallery images with offset-based pagination and custom limit
  // for my gallery, I use limit=1 to get one image at a time
  module.getImages = function (page, limit) {
    return fetch(`/api/images?limit=${limit}&page=${page}`).then(function (
      res
    ) {
      if (!res.ok) {
        throw new Error("Failed to get images");
      }
      return res.json();
    });
  };

  // return the size of the gallery (how many images are in it)
  module.getImageCount = function () {
    return fetch("/api/images/count")
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to get image count");
        }
        return res.json();
      })
      .then(function (data) {
        return data.count;
      });
  };

  // get the details of an image by its imageId
  module.getImage = function (imageId) {
    return fetch(`/api/images/${imageId}`).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to get image details");
      }
      return res.json();
    });
  };

  module.getImageIndex = function (imageId) {
    return fetch(`/api/images/${imageId}/index`)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to get image index");
        }
        return res.json();
      })
      .then(function (data) {
        return data.index;
      });
  };

  /* --------- Comments -----------*/

  // add a comment to an image
  module.addComment = function (imageId, author, content) {
    return fetch(`/api/images/${imageId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ author, content }),
    }).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to add comment");
      }
      return res.json();
    });
  };

  // delete a comment to an image
  module.deleteComment = function (commentId) {
    return fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to delete comment");
      }
      return res.json();
    });
  };

  // get comments for image with pagination
  module.getComments = function (imageId, page = 0) {
    return fetch(`/api/images/${imageId}/comments?page=${page}`)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to get comments");
        }
        return res.json();
      })
      .then(function (json) {
        return {
          comments: json.comments,
          totalCount: json.totalCount,
        };
      });
  };

  /* ------------ Users -------------*/

  // sign up a new user
  module.signUp = function (username, password) {
    return fetch("/api/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to sign up");
      }
      return res.json();
    });
  };

  // sign in an existing user
  module.signIn = function (username, password) {
    return fetch("/api/users/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to sign in");
      }
      return res.json();
    });
  };

  // sign out a user
  module.signOut = function (token) {
    return fetch("/api/users/signout", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to sign out");
      }
      return res.json();
    });
  };

  // get current user details
  module.getCurrentUser = function (token) {
    return fetch("/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to get current user");
      }
      return res.json();
    });
  };

  /* --------- Galleries -----------*/

  // get all galleries with pagination
  module.getGalleries = function (page = 1, limit = 10) {
    return fetch(`/api/galleries?page=${page}&limit=${limit}`).then(function (
      res
    ) {
      if (!res.ok) throw new Error("Failed to get galleries");
      return res.json();
    });
  };

  // get images for a specific gallery with pagination
  module.getGalleryImages = function (galleryId, page = 0, limit = 1) {
    return fetch(
      `/api/images/gallery/${galleryId}?page=${page}&limit=${limit}`
    ).then(function (res) {
      if (!res.ok) throw new Error("Failed to get gallery images");
      return res.json();
    });
  };

  module.getGalleryImageCount = function (galleryId) {
    return fetch(`/api/images/gallery/${galleryId}`)
      .then((res) => res.json())
      .then((data) => data.totalCount);
  };

  module.getGallery = function (galleryId) {
    return fetch(`/api/galleries/${galleryId}`).then(function (res) {
      if (!res.ok) throw new Error("Failed to get gallery");
      return res.json();
    });
  };

  return module;
})();
