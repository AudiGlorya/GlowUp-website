emailjs.init({
  publicKey: "RzDXQ2rJgGZerjoP2"
});


/* =====================================================
   FIREBASE IMPORTS
===================================================== */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


import {
  getFirestore,
  doc,
  getDocs,
  collection,
  query,
  where,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =====================================================
   FIREBASE CONFIGURATION
===================================================== */

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


/* =====================================================
   INITIALIZE FIREBASE
===================================================== */

const app =
  initializeApp(firebaseConfig);


/* =====================================================
   CONNECT TO FIRESTORE
===================================================== */

const db =
  getFirestore(app);


/* =====================================================
   FORM ELEMENTS
===================================================== */

const bookingForm =
  document.getElementById("bookingForm");

const dateInput =
  document.getElementById("date");

const timeSelect =
  document.getElementById("time");

const nailCareSelect =
  document.getElementById("nailCare");

const serviceSelect =
  document.getElementById("service");

const lashSetSelect =
  document.getElementById("lashSet");

const submitButton =
  document.getElementById("submitButton");


/* =====================================================
   PREVENT PAST DATES
===================================================== */

const today =
  new Date();

const todayString =
  today.getFullYear() +
  "-" +
  String(today.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(today.getDate()).padStart(2, "0");

dateInput.min =
  todayString;


/* =====================================================
   WORKING HOURS
===================================================== */

const START_HOUR = 5;
const END_HOUR = 20;


/* =====================================================
   APPOINTMENT DURATION
===================================================== */

function getAppointmentDuration() {

  const hasNails =
    nailCareSelect.value !== "N/A" ||
    serviceSelect.value !== "N/A";


  const hasLashes =
    lashSetSelect.value !== "N/A";


  if (hasNails && hasLashes) {

    return 210;

  }


  if (hasNails) {

    return 120;

  }


  if (hasLashes) {

    return 90;

  }


  return 0;

}


/* =====================================================
   TIME CONVERSION
===================================================== */

function timeToMinutes(time) {

  const [hour, minute] =
    time.split(":").map(Number);

  return hour * 60 + minute;

}


/* =====================================================
   FORMAT TIME
===================================================== */

function formatTime(totalMinutes) {

  const hour =
    Math.floor(totalMinutes / 60);

  const minutes =
    totalMinutes % 60;

  const period =
    hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour % 12 === 0
      ? 12
      : hour % 12;

  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;

}


/* =====================================================
   CREATE AVAILABLE TIMES
===================================================== */

function createTimeOptions(bookedSlots = []) {

  const selectedDate =
    dateInput.value;

  const now =
    new Date();


  const todayString =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");


  timeSelect.innerHTML =
    "";


  const duration =
    getAppointmentDuration();


  if (duration === 0) {

    const option =
      document.createElement("option");

    option.value =
      "";

    option.textContent =
      "Select a service first";

    option.disabled =
      true;

    option.selected =
      true;

    timeSelect.appendChild(
      option
    );

    return;

  }


  const defaultOption =
    document.createElement("option");

  defaultOption.value =
    "";

  defaultOption.textContent =
    "Choose a time";

  defaultOption.disabled =
    true;

  defaultOption.selected =
    true;

  timeSelect.appendChild(
    defaultOption
  );


  for (
    let hour = START_HOUR;
    hour < END_HOUR;
    hour++
  ) {

    const startMinutes =
      hour * 60;


    if (
      selectedDate === todayString
    ) {

      const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


      if (
        startMinutes <= currentMinutes
      ) {

        continue;

      }

    }


    const finishMinutes =
      startMinutes + duration;


    if (
      finishMinutes >
      END_HOUR * 60
    ) {

      continue;

    }


    const time =
      `${String(hour).padStart(2, "0")}:00`;


    const option =
      document.createElement("option");


    option.value =
      time;


    option.textContent =
      formatTime(startMinutes);


    const overlaps =
      bookedSlots.some(slot => {

        const existingStart =
          timeToMinutes(slot.time);

        const existingEnd =
          existingStart +
          slot.duration;


        return (
          startMinutes < existingEnd &&
          finishMinutes > existingStart
        );

      });


    if (overlaps) {

      option.disabled =
        true;

      option.textContent +=
        " — Unavailable";

    }


    timeSelect.appendChild(
      option
    );

  }

}


/* =====================================================
   LOAD PUBLIC AVAILABILITY
===================================================== */

async function loadAvailability() {

  const selectedDate =
    dateInput.value;


  const duration =
    getAppointmentDuration();


  if (
    !selectedDate ||
    duration === 0
  ) {

    createTimeOptions();

    return;

  }


  timeSelect.innerHTML =
    '<option value="">Checking availability...</option>';


  try {

    const availabilityQuery =
      query(
        collection(
          db,
          "availability"
        ),
        where(
          "date",
          "==",
          selectedDate
        )
      );


    const snapshot =
      await getDocs(
        availabilityQuery
      );


    const bookedSlots =
      [];


    snapshot.forEach(slot => {

      const data =
        slot.data();


      if (
        data.available === false
      ) {

        bookedSlots.push({

          time:
            data.time,

          duration:
            data.duration || 60

        });

      }

    });


    createTimeOptions(
      bookedSlots
    );


  } catch (error) {

    console.error(
      "Availability error:",
      error
    );


    timeSelect.innerHTML =
      '<option value="">Could not load times</option>';

  }

}


/* =====================================================
   UPDATE AVAILABLE TIMES
===================================================== */

dateInput.addEventListener(
  "change",
  loadAvailability
);

nailCareSelect.addEventListener(
  "change",
  loadAvailability
);

serviceSelect.addEventListener(
  "change",
  loadAvailability
);

lashSetSelect.addEventListener(
  "change",
  loadAvailability
);


/* =====================================================
   INITIAL STATE
===================================================== */

createTimeOptions();


/* =====================================================
   SUBMIT BOOKING
===================================================== */

bookingForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    /* ================================================
       GET FORM VALUES
    ================================================ */

    const whatsapp =
      document
        .getElementById("whatsapp")
        .value
        .trim();


    const email =
      document
        .getElementById("email")
        .value
        .trim();


    const nailCare =
      nailCareSelect.value;


    const service =
      serviceSelect.value;


    const lashSet =
      lashSetSelect.value;


    const date =
      dateInput.value;


    const time =
      timeSelect.value;


    const duration =
      getAppointmentDuration();


    /* ================================================
       VALIDATION
    ================================================ */

    if (duration === 0) {

      alert(
        "Please select at least one service."
      );

      return;

    }


    if (!date || !time) {

      alert(
        "Please select a date and time."
      );

      return;

    }


    if (!whatsapp) {

      alert(
        "Please enter your WhatsApp contact."
      );

      return;

    }


    if (!email) {

      alert(
        "Please enter your email address."
      );

      return;

    }


    /* ================================================
       BOOKING ID
    ================================================ */

    const bookingId =
      `${date}_${time.replace(":", "-")}`;


    const bookingRef =
      doc(
        db,
        "bookings",
        bookingId
      );


    try {

      /* ==============================================
         DISABLE BUTTON WHILE BOOKING
      ============================================== */

      submitButton.disabled =
        true;

      submitButton.textContent =
        "Booking...";


      /* ==============================================
         FIRESTORE TRANSACTION
      ============================================== */

      await runTransaction(
        db,
        async (transaction) => {

          const numberOfSlots =
            Math.ceil(
              duration / 60
            );


          const availabilityRefs =
            [];


          /* ------------------------------------------
             CREATE SLOT REFERENCES
          ------------------------------------------ */

          for (
            let i = 0;
            i < numberOfSlots;
            i++
          ) {

            const slotMinutes =
              timeToMinutes(time) +
              (i * 60);


            const slotHour =
              Math.floor(
                slotMinutes / 60
              );


            const slotTime =
              `${String(slotHour).padStart(2, "0")}:00`;


            const slotId =
              `${date}_${slotTime.replace(":", "-")}`;


            const slotRef =
              doc(
                db,
                "availability",
                slotId
              );


            availabilityRefs.push({

              ref:
                slotRef,

              time:
                slotTime

            });

          }


          /* ------------------------------------------
             READ ALL SLOTS
          ------------------------------------------ */

          const availabilitySnapshots =
            [];


          for (
            const slot of availabilityRefs
          ) {

            const snapshot =
              await transaction.get(
                slot.ref
              );


            availabilitySnapshots.push(
              snapshot
            );

          }


          /* ------------------------------------------
             CHECK CONFLICTS
          ------------------------------------------ */

          for (
            const snapshot of
            availabilitySnapshots
          ) {

            if (
              snapshot.exists() &&
              snapshot.data().available === false
            ) {

              throw new Error(
                "SLOT_ALREADY_BOOKED"
              );

            }

          }


          /* ------------------------------------------
             SAVE BOOKING
          ------------------------------------------ */

          transaction.set(
            bookingRef,
            {

              whatsapp:
                whatsapp,

              email:
                email,

              nailCare:
                nailCare,

              service:
                service,

              lashSet:
                lashSet,

              date:
                date,

              time:
                time,

              duration:
                duration,

              status:
                "pending",

              createdAt:
                serverTimestamp()

            }
          );


          /* ------------------------------------------
             LOCK SLOTS
          ------------------------------------------ */

          for (
            const slot of availabilityRefs
          ) {

            transaction.set(
              slot.ref,
              {

                date:
                  date,

                time:
                  slot.time,

                duration:
                  duration,

                available:
                  false

              }
            );

          }

        }
      );


      /* =================================================
         FIRESTORE SUCCESS
      ================================================= */


      /* =================================================
         SEND CLIENT EMAIL
      ================================================= */

      let clientEmailSent =
        false;


      try {

        await emailjs.send(

          "service_zrn4dpj",

          "template_rnhoym3",

          {

            client_name:
              "Audelles",

            client_email:
              email,

            service:
              service,

            date:
              date,

            time:
              formatTime(
                timeToMinutes(time)
              ),

            phone:
              whatsapp,

            whatsapp:
              whatsapp,

            nailCare:
              nailCare,

            lashSet:
              lashSet,

            duration:
              duration

          }

        );


        clientEmailSent =
          true;


        console.log(
          "Client confirmation email sent."
        );


      } catch (emailError) {

        console.error(
          "Client email error:",
          emailError
        );

      }


      /* =================================================
         SEND ADMIN EMAIL
      ================================================= */

      let adminEmailSent =
        false;


      try {

        await emailjs.send(

          "service_zrn4dpj",

          "template_wp82enw",

          {

            client_name:
              "Audelles Client",

            client_email:
              email,

            service:
              service,

            date:
              date,

            time:
              formatTime(
                timeToMinutes(time)
              ),

            phone:
              whatsapp,

            whatsapp:
              whatsapp,

            nailCare:
              nailCare,

            lashSet:
              lashSet,

            duration:
              duration

          }

        );


        adminEmailSent =
          true;


        console.log(
          "Admin booking notification sent."
        );


      } catch (adminEmailError) {

        console.error(
          "Admin email error:",
          adminEmailError
        );

      }


      /* =================================================
         SUCCESS MESSAGE
      ================================================= */

      if (
        clientEmailSent &&
        adminEmailSent
      ) {

        alert(
          "Thank you! Your booking has been received. A confirmation email has been sent to you."
        );

      } else if (
        clientEmailSent
      ) {

        alert(
          "Thank you! Your booking has been received. A confirmation email has been sent to you."
        );

      } else {

        alert(
          "Thank you! Your booking has been received. We will confirm it shortly."
        );

      }


      /* =================================================
         RESET FORM
      ================================================= */

      bookingForm.reset();

      createTimeOptions();


    } catch (error) {

      console.error(
        "Booking error:",
        error
      );


      /* ================================================
         RE-ENABLE BUTTON
      ================================================ */

      submitButton.disabled =
        false;

      submitButton.textContent =
        "Book Now +";


      /* ================================================
         DOUBLE BOOKING
      ================================================ */

      if (
        error.message ===
        "SLOT_ALREADY_BOOKED"
      ) {

        alert(
          "Sorry, that time has already been booked. Please choose another time."
        );


      } else {

        alert(
          "Sorry, your booking could not be submitted. Please try again."
        );

      }


      loadAvailability();

      return;

    }


    /* =================================================
       RE-ENABLE BUTTON AFTER SUCCESS
    ================================================= */

    submitButton.disabled =
      false;

    submitButton.textContent =
      "Book Now +";

  }

);
