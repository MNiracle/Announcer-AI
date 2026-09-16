const username =
    document.getElementById("username");

const password =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");


loginButton.addEventListener(
    "click",
    function () {

        const enteredUsername =
            username.value.trim();

        const enteredPassword =
            password.value;


        /*
           Administrator credentials
        */

        const correctUsername =
            "Borngreat";

        const correctPassword =
            "admin123";


        if (
            enteredUsername === correctUsername &&
            enteredPassword === correctPassword
        ) {

            sessionStorage.setItem(
                "announcerAdmin",
                "true"
            );


            window.location.href =
                "admin.html";

        }

        else {

            loginMessage.textContent =
                "❌ Incorrect username or password.";

        }

    }
);

