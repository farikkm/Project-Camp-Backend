import Mailgen from "mailgen";

const emailVerficationMailgenContent = (username, verificationUrl) => ({
	body: {
		name: username,
		intro:
			"Welcome to Project Manager App! We're very excited to have you on board.",
		action: {
			instructions: "To verify your email, please click here:",
			button: {
				color: "#22BC66",
				text: "Verify your email",
				link: verificationUrl,
			},
		},
		outro:
			"Need help, or have questions? Just reply to this email, we'd love to help.",
	},
});

const resetPasswordMailgenContent = (username, verificationUrl) => ({
	body: {
		name: username,
		intro: "We get the request from your account to reset your password",
		action: {
			instructions: "To reset password of your account, please click here:",
			button: {
				color: "#22BC66",
				text: "Reset password",
				link: verificationUrl,
			},
		},
		outro:
			"Need help, or have questions? Just reply to this email, we'd love to help.",
	},
});
