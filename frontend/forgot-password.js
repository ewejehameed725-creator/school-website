document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("forgotPasswordForm");
    const message = document.getElementById("forgotPasswordMessage");
    const button = document.getElementById("resetPasswordButton");

    if (!form) return;

    // CHANGE THIS ONLY IF YOUR RENDER BACKEND URL IS DIFFERENT
    const API_URL = "https://YOUR-RENDER-BACKEND.onrender.com";

    function showMessage(text, type = "error") {

        message.textContent = text;
        message.style.display = "block";

        message.className = "auth-message";

        if (type === "success") {
            message.classList.add("success");
        } else {
            message.classList.add("error");
        }
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const username =
            document.getElementById("forgotUsername").value.trim();

        const phone =
            document.getElementById("forgotPhone").value.trim();

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (!username || !phone || !newPassword || !confirmPassword) {
            showMessage("Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage("The passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            showMessage("Password must be at least 6 characters.");
            return;
        }

        button.disabled = true;
        button.textContent = "Resetting Password...";

        try {

            const response = await fetch(
                `${API_URL}/api/staff/forgot-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        phone,
                        newPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                showMessage(
                    data.message ||
                    "Unable to reset password."
                );

                return;
            }

            showMessage(
                "Password reset successfully. You can now log in.",
                "success"
            );

            form.reset();

            setTimeout(() => {
                window.location.href = "admin-login.html";
            }, 2000);

        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );

            showMessage(
                "Unable to connect to school server."
            );

        } finally {

            button.disabled = false;
            button.textContent = "Reset Password";

        }

    });

});