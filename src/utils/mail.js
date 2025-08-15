import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendMail = async (options) => {
	const mailGenerator = new Mailgen({
		theme: "default",
		product: {
			name: "Project Manager",
			link: "https://projectmanager.vercel.app",
		},
	});

	const emailHTML = mailGenerator.generate(options.mailGeneratorContent);
	const emailText = mailGenerator.generatePlaintext(
		options.mailGeneratorContent,
	);

	const transporter = nodemailer.createTransport({
		host: process.env.MAILTRAP_SMTP_HOST,
		port: process.env.MAILTRAP_SMTP_PORT,
		auth: {
			user: process.env.MAILTRAP_SMTP_USERNAME,
			pass: process.env.MAILTRAP_SMTP_PASSWORD,
		},
	});

	const mail = {
		from: "mail.projectmanager@example.com",
		to: options.email,
		subject: options.subject,
		text: emailText,
		html: emailHTML,
	};

	try {
		await transporter.sendMail(mail);
	} catch (error) {
		console.error(
			"Email service failed. Make sure you passed your credentials",
		);
		console.error("Error:", error);
	}
};

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

export {
	emailVerficationMailgenContent,
	resetPasswordMailgenContent,
	sendMail,
};
