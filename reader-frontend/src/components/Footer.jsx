import {
	faGithub,
	faXTwitter,
	faLinkedin,
	faInstagram,
	faFacebook,
	faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="mt-8 bg-slate-50">
			<div className="mx-auto max-w-3xl pt-3 pb-5 px-6 md:px-0 flex flex-col items-center gap-4 text-base text-slate-500 sm:flex-row sm:justify-between">
				<div>
					<p>&copy; {currentYear} My Blog</p>
				</div>

				{/* Social Media Links */}
				<div className="flex gap-3 text-slate-500 text-base">
					<a
						href="https://twitter.com/yourusername"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-slate-900"
					>
						<FontAwesomeIcon icon={faXTwitter} />
					</a>
					<a
						href="https://github.com/yourusername"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-slate-900"
					>
						<FontAwesomeIcon icon={faGithub} />
					</a>
					<a
						href="https://linkedin.com/in/yourusername"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-slate-900"
					>
						<FontAwesomeIcon icon={faLinkedin} />
					</a>
					<a
						href="https://instagram.com/yourusername"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-slate-900"
					>
						<FontAwesomeIcon icon={faInstagram} />
					</a>
					<a
						href="https://facebook.com/yourusername"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-slate-900"
					>
						<FontAwesomeIcon icon={faFacebook} />
					</a>
					<a
						href="https://tiktok.com/@yourusername"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-slate-900"
					>
						<FontAwesomeIcon icon={faTiktok} />
					</a>
				</div>
			</div>
		</footer>
	);
};
