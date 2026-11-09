import {
      initializeApp
    } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


    import {
      getAuth,
      signInWithEmailAndPassword,
      onAuthStateChanged,
      signOut
    } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


    import {
      getFirestore,
      collection,
      getDocs,
      query,
      orderBy,
      updateDoc,
      doc
    } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


    // =========================
    // FIREBASE CONFIGURATION
    // =========================

    const firebaseConfig = {

      apiKey:
        "AIzaSyAop8tpwJOVLvmlHSzzLTKqrof5eWfzxEo",

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

    const auth =
      getAuth(app);

    const db =
      getFirestore(app);


    // =========================
    // ELEMENTS
    // =========================

    const loginSection =
      document.getElementById(
        "loginSection"
      );

    const adminDashboard =
      document.getElementById(
        "adminDashboard"
      );

    const loginBtn =
      document.getElementById(
        "loginBtn"
      );

    const logoutBtn =
      document.getElementById(
        "logoutBtn"
      );

    const loginMessage =
      document.getElementById(
        "loginMessage"
      );

    const bookingsList =
      document.getElementById(
        "bookingsList"
      );

    const bookingMessage =
      document.getElementById(
        "bookingMessage"
      );

    const reviewsList =
      document.getElementById(
        "reviewsList"
      );

    const reviewMessage =
      document.getElementById(
        "reviewMessage"
      );


    // =========================
    // LOGIN
    // =========================

    loginBtn.addEventListener(
      "click",
      async () => {

        const email =
          document
            .getElementById("email")
            .value
            .trim();

        const password =
          document
            .getElementById("password")
            .value;


        loginMessage.textContent = "";


        if (!email || !password) {

          loginMessage.textContent =
            "Please enter your email and password.";

          return;
        }


        loginBtn.disabled = true;

        loginBtn.textContent =
          "Signing in...";


        try {

          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

        } catch (error) {

          console.error(
            "Firebase login error:",
            error
          );


          // SHOW THE ACTUAL FIREBASE ERROR
          loginMessage.textContent =
            `${error.code}: ${error.message}`;

        } finally {

          loginBtn.disabled = false;

          loginBtn.textContent =
            "Login";

        }

      }
    );


    // =========================
    // LOGOUT
    // =========================

    logoutBtn.addEventListener(
      "click",
      async () => {

        try {

          await signOut(auth);

        } catch (error) {

          console.error(
            "Logout error:",
            error
          );

        }

      }
    );


    // =========================
    // AUTHENTICATION STATE
    // =========================

    onAuthStateChanged(
      auth,
      user => {

        if (user) {

          loginSection.style.display =
            "none";

          adminDashboard.style.display =
            "block";

          loadBookings();

          loadReviews();

        } else {

          loginSection.style.display =
            "block";

          adminDashboard.style.display =
            "none";

        }

      }
    );


    // =========================
    // LOAD BOOKINGS
    // =========================

    async function loadBookings() {

      bookingsList.innerHTML = "";

      bookingMessage.textContent =
        "Loading bookings...";


      try {

        const bookingsQuery =
          query(
            collection(
              db,
              "bookings"
            ),
            orderBy(
              "date",
              "asc"
            )
          );


        const snapshot =
          await getDocs(
            bookingsQuery
          );


        if (snapshot.empty) {

          bookingMessage.textContent =
            "No bookings yet.";

          return;
        }


        bookingMessage.textContent =
          "";


        snapshot.forEach(
          bookingDoc => {

            const booking =
              bookingDoc.data();


            const bookingDiv =
              document.createElement(
                "div"
              );


            bookingDiv.className =
              "booking";


            bookingDiv.innerHTML = `

              <p>
                <strong>WhatsApp:</strong>
                ${escapeHTML(
                  booking.whatsapp ||
                  "Not provided"
                )}
              </p>

              <p>
                <strong>Date:</strong>
                ${escapeHTML(
                  booking.date || "—"
                )}
              </p>

              <p>
                <strong>Time:</strong>
                ${formatTime(
                  booking.time
                )}
              </p>

              <p>
                <strong>Duration:</strong>
                ${formatDuration(
                  booking.duration
                )}
              </p>

              <p>
                <strong>Nail Care:</strong>
                ${escapeHTML(
                  booking.nailCare || "—"
                )}
              </p>

              <p>
                <strong>Service:</strong>
                ${escapeHTML(
                  booking.service || "—"
                )}
              </p>

              <p>
                <strong>Lash Set:</strong>
                ${escapeHTML(
                  booking.lashSet || "—"
                )}
              </p>

              <p>
                <strong>Status:</strong>

                <span class="status">
                  ${escapeHTML(
                    booking.status ||
                    "pending"
                  )}
                </span>

              </p>

              <button
                class="action-btn confirm-btn"
                data-id="${bookingDoc.id}"
              >
                Confirm
              </button>

            `;


            bookingsList.appendChild(
              bookingDiv
            );

          }
        );


        // =========================
        // CONFIRM BUTTONS
        // =========================

        document
          .querySelectorAll(
            ".confirm-btn"
          )
          .forEach(button => {

            button.addEventListener(
              "click",
              () => {

                updateBookingStatus(
                  button.dataset.id
                );

              }
            );

          });


      } catch (error) {

        console.error(
          "Loading bookings error:",
          error
        );


        bookingMessage.textContent =
          "Could not load bookings.";

      }

    }


    // =========================
    // CONFIRM BOOKING
    // =========================

    async function updateBookingStatus(
      bookingId
    ) {

      try {

        const bookingRef =
          doc(
            db,
            "bookings",
            bookingId
          );


        await updateDoc(
          bookingRef,
          {
            status: "confirmed"
          }
        );


        alert(
          "Booking confirmed."
        );


        loadBookings();

      } catch (error) {

        console.error(
          "Status update error:",
          error
        );


        alert(
          "Could not confirm this booking."
        );

      }

    }


    // =========================
    // LOAD REVIEWS
    // =========================

    async function loadReviews() {

      reviewsList.innerHTML = "";

      reviewMessage.textContent =
        "Loading reviews...";


      try {

        const reviewsQuery =
          query(
            collection(
              db,
              "reviews"
            ),
            orderBy(
              "createdAt",
              "desc"
            )
          );


        const snapshot =
          await getDocs(
            reviewsQuery
          );


        if (snapshot.empty) {

          reviewMessage.textContent =
            "No reviews yet.";

          return;
        }


        reviewMessage.textContent =
          "";


        snapshot.forEach(
          reviewDoc => {

            const review =
              reviewDoc.data();


            const reviewDiv =
              document.createElement(
                "div"
              );


            reviewDiv.className =
              "admin-review";


            const rating =
              Number(
                review.rating
              ) || 0;


            const stars =
              "★".repeat(rating) +
              "☆".repeat(
                5 - rating
              );


            reviewDiv.innerHTML = `

              <div class="admin-stars">
                ${stars}
              </div>

              <p class="review-text">
                "${escapeHTML(
                  review.review ||
                  ""
                )}"
              </p>

              <div class="review-name">
                ${escapeHTML(
                  review.name ||
                  "Anonymous"
                )}
              </div>

            `;


            reviewsList.appendChild(
              reviewDiv
            );

          }
        );


      } catch (error) {

        console.error(
          "Loading reviews error:",
          error
        );


        reviewMessage.textContent =
          "Could not load reviews.";

      }

    }


    // =========================
    // FORMAT TIME
    // =========================

    function formatTime(time) {

      if (!time) {
        return "—";
      }


      const [hour, minute] =
        time
          .split(":")
          .map(Number);


      const period =
        hour >= 12
          ? "PM"
          : "AM";


      const displayHour =
        hour % 12 === 0
          ? 12
          : hour % 12;


      return (
        `${displayHour}:${String(
          minute
        ).padStart(2, "0")} ${period}`
      );

    }


    // =========================
    // FORMAT DURATION
    // =========================

    function formatDuration(
      minutes
    ) {

      if (!minutes) {
        return "—";
      }


      const hours =
        Math.floor(
          minutes / 60
        );


      const mins =
        minutes % 60;


      if (hours === 0) {

        return `${mins} minutes`;

      }


      if (mins === 0) {

        return (
          `${hours} hour${
            hours > 1
              ? "s"
              : ""
          }`
        );

      }


      return (
        `${hours} hours ${mins} minutes`
      );

    }


    // =========================
    // SECURITY HELPER
    // =========================

    function escapeHTML(value) {

      return String(value)
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        )
        .replace(
          /"/g,
          "&quot;"
        )
        .replace(
          /'/g,
          "&#039;"
        );

    }
