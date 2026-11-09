import {  
    initializeApp  
  } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";  
  
  
  import {  
    getFirestore,  
    collection,  
    addDoc,  
    getDocs,  
    query,  
    orderBy,  
    serverTimestamp  
  } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";  
  
  
  // =========================  
  // FIREBASE CONFIGURATION  
  // =========================  
  
  const firebaseConfig = {  
  
    apiKey:  
      "AIzaSyAop8tpjWOVLvmlHSzzLTKqrof5eWfzxEo",  
  
    authDomain:  
      "webiz-2c4eb.firebaseapp.com",  
  
    projectId:  
      "webiz-2c4eb",  
  
    storageBucket:  
      "webiz-2c4eb.firebasestorage.app",  
  
    messagingSenderId:  
      "167900099646",  
  
    appId:  
      "1:167900099646:web:e36c37284a3aa95a654d6f",  
  
    measurementId:  
      "G-25CY4RH7F5"  
  
  };  
  
  
  // =========================  
  // INITIALIZE FIREBASE  
  // =========================  
  
  const app =  
    initializeApp(firebaseConfig);  
  
  
  const db =  
    getFirestore(app);  
  
  
  // =========================  
  // ELEMENTS  
  // =========================  
  
  const reviewForm =  
    document.getElementById("reviewForm");  
  
  const nameInput =  
    document.getElementById("reviewName");  
  
  const reviewInput =  
    document.getElementById("reviewText");  
  
  const ratingInput =  
    document.getElementById("rating");  
  
  const starButtons =  
    document.querySelectorAll(  
      "#starRating button"  
    );  
  
  const reviewsContainer =  
    document.getElementById(  
      "reviewsContainer"  
    );  
  
  const submitButton =  
    document.getElementById(  
      "submitReview"  
    );  
  
  
  // =========================  
  // STAR RATING  
  // =========================  
  
  starButtons.forEach(button => {  
  
    button.addEventListener(  
      "click",  
      () => {  
  
        const rating =  
          Number(  
            button.dataset.rating  
          );  
  
  
        ratingInput.value =  
          rating;  
  
  
        starButtons.forEach(star => {  
  
          const starRating =  
            Number(  
              star.dataset.rating  
            );  
  
  
          if (  
            starRating <= rating  
          ) {  
  
            star.classList.add(  
              "selected"  
            );  
  
          } else {  
  
            star.classList.remove(  
              "selected"  
            );  
  
          }  
  
        });  
  
      }  
    );  
  
  });  
  
  
  // =========================  
  // DISPLAY REVIEWS  
  // =========================  
  
  async function loadReviews() {  
  
    reviewsContainer.innerHTML =  
      '<div class="reviews-loading">Loading reviews...</div>';  
  
  
    try {  
  
      const reviewsQuery =  
        query(  
          collection(db, "reviews"),  
          orderBy(  
            "createdAt",  
            "desc"  
          )  
        );  
  
  
      const snapshot =  
        await getDocs(  
          reviewsQuery  
        );  
  
  
      reviewsContainer.innerHTML = "";  
  
  
      if (snapshot.empty) {  
  
        reviewsContainer.innerHTML =  
          '<div class="no-reviews">No reviews yet. Be the first to share your GlowUp experience ♡</div>';  
  
        return;  
      }  
  
  
      snapshot.forEach(documentSnapshot => {  
  
        const data =  
          documentSnapshot.data();  
  
  
        const card =  
          document.createElement("div");  
  
        card.className =  
          "review-card";  
  
        card.style.background =  
          "#fff";  
  
  
        const stars =  
          "★".repeat(  
            Number(data.rating) || 0  
          ) +  
          "☆".repeat(  
            5 - (Number(data.rating) || 0)  
          );  
  
  
        const starsDiv =  
          document.createElement("div");  
  
        starsDiv.className =  
          "stars";  
  
        starsDiv.style.color =  
          "#c98a6b";  
  
        starsDiv.textContent =  
          stars;  
  
  
        const paragraph =  
          document.createElement("p");  
  
        paragraph.style.color =  
          "#5c4f47";  
  
        paragraph.textContent =  
          `"${data.review || ""}"`;  
  
  
        const who =  
          document.createElement("div");  
  
        who.className =  
          "who";  
  
        who.style.color =  
          "#7a6a61";  
  
        who.textContent =  
          data.name || "Anonymous";  
  
  
        card.appendChild(  
          starsDiv  
        );  
  
        card.appendChild(  
          paragraph  
        );  
  
        card.appendChild(  
          who  
        );  
  
  
        reviewsContainer.appendChild(  
          card  
        );  
  
      });  
  
  
    } catch (error) {  
  
      console.error(  
        "Error loading reviews:",  
        error  
      );  
  
  
      reviewsContainer.innerHTML =  
        '<div class="no-reviews">Reviews could not be loaded right now.</div>';  
  
    }  
  
  }  
  
  
  // =========================  
  // SUBMIT REVIEW  
  // =========================  
  
  reviewForm.addEventListener(  
    "submit",  
    async event => {  
  
      event.preventDefault();  
  
  
      const name =  
        nameInput.value.trim();  
  
      const review =  
        reviewInput.value.trim();  
  
      const rating =  
        Number(  
          ratingInput.value  
        );  
  
  
      // =========================  
      // VALIDATION  
      // =========================  
  
      if (!name) {  
  
        alert(  
          "Please enter your name."  
        );  
  
        return;  
      }  
  
  
      if (!rating) {  
  
        alert(  
          "Please select a star rating."  
        );  
  
        return;  
      }  
  
  
      if (!review) {  
  
        alert(  
          "Please write a review."  
        );  
  
        return;  
      }  
  
  
      // =========================  
      // DISABLE BUTTON  
      // =========================  
  
      submitButton.disabled =  
        true;  
  
      submitButton.textContent =  
        "Submitting...";  
  
  
      try {  
  
        // =========================  
        // SAVE REVIEW  
        // =========================  
  
        await addDoc(  
          collection(  
            db,  
            "reviews"  
          ),  
          {  
  
            name:  
              name,  
  
            rating:  
              rating,  
  
            review:  
              review,  
  
            createdAt:  
              serverTimestamp()  
  
          }  
        );  
  
  
        alert(  
          "Thank you for your review! ♡"  
        );  
  
  
        // Reset form  
        reviewForm.reset();  
  
  
        ratingInput.value =  
          "";  
  
  
        starButtons.forEach(  
          star =>  
            star.classList.remove(  
              "selected"  
            )  
        );  
  
  
        // Reload reviews  
        await loadReviews();  
  
  
      } catch (error) {  
  
        console.error(  
          "Review submission error:",  
          error  
        );  
  
  
        alert(  
          "Sorry, your review could not be submitted. Please try again."  
        );  
  
      } finally {  
  
        submitButton.disabled =  
          false;  
  
        submitButton.textContent =  
          "Submit Review +";  
  
      }  
  
    }  
  );  
  
  
  // =========================  
  // LOAD REVIEWS ON PAGE LOAD  
  // =========================  
  
  loadReviews(); 