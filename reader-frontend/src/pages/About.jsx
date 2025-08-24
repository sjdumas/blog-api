import { useState } from "react";

export default function About() {
	const avatarUrl = "/avatar.png" // place avatar img in the project's public/ folder
	const [imgError, setImgError] = useState(false);

	// Fallback initials shown if the image fails to load
	const initials = "SJD";

	return (
		<div className="space-y-8">
			{/* bio */}
			<section className="bio">
				<h1 className="text-3xl font-bold">About</h1>
				<div className="mt-2">
					<p>
						I’m a self-taught web developer. I initially got started on the front-end, building the UI for the client side. Eventually, I expanded my horizons into building full-stack web apps with JavaScript, TypeScript, React, Node.js, and PostgreSQL.
					</p>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores enim, ullam alias veritatis assumenda, aliquam eos odit adipisci nemo ex corporis nam reiciendis, dicta est veniam. Quis eveniet dignissimos facere!
					</p>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere libero ducimus ea magnam blanditiis, similique exercitationem nostrum, in vel minima est ipsum ex voluptatibus quisquam quas rem nemo animi? Consequuntur.
					</p>
				</div>
			</section>

			{/* experience */}
			<section className="experience">
				<h3 className="text-xl">Experience</h3>
				<div className="mt-4 space-y-4">
					{/* Item 1 */}
					<div className="relative pl-6">
						<span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-slate-400" />
						<h4 className="text-base font-medium text-slate-900">
							Frontend Developer (Freelance)
						</h4>
						<p className="text-sm text-slate-500">2023 – Present</p>
						<p>
							Built responsive websites and small apps for local businesses using
							React, Tailwind CSS, and Next.js. Focused on performance and clean UI.
						</p>
					</div>

					{/* Item 2 */}
					<div className="relative pl-6">
						<span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-slate-400" />
						<h4 className="text-base font-medium text-slate-900">
							Full-Stack Project (Personal)
						</h4>
						<p className="text-sm text-slate-500">2022 – 2023</p>
						<p>
							Designed and deployed a blog-API application with authentication,
							admin dashboards, and role-based access. Tech stack: Node.js,
							Express, Prisma, PostgreSQL, React.
						</p>
					</div>

					{/* Item 3 */}
					<div className="relative pl-6">
						<span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-slate-400" />
						<h4 className="text-base font-medium text-slate-900">
							Learning Journey
						</h4>
						<p className="text-sm text-slate-500">Ongoing</p>
						<p>
							Self-taught path through The Odin Project, CS fundamentals,
							and hands-on building. Continuously expanding knowledge in
							JavaScript, databases, and modern web tooling.
						</p>
					</div>
				</div>
			</section>

			{/* tech stack */}
			<section className="tech-stack">
				<h3 className="text-xl font-semibold">Current Tech Stack</h3>
				<ul className="mt-4 flex flex-wrap gap-2">
					{[
						"React",
						"Next.js",
						"Tailwind CSS",
						"Node.js",
						"Express",
						"Prisma",
						"PostgreSQL",
						"MySQL",
						"TypeScript",
						"Git & GitHub",
					].map((tag) => (
						<li
							key={tag}
							className="rounded border border-slate-900 bg-slate-50 px-3 py-1 text-xs text-slate-700"
						>
							{tag}
						</li>
					))}
				</ul>
			</section>

			{/* contact */}
			<section className="contact">
				<h3 className="text-xl font-semibold">Let’s connect</h3>
				<p>
					Have a question, feedback, or just want to say hi? You can reach me at{" "}
					<a
						href="mailto:you@example.com"
						className="text-blue-600 hover:text-blue-700"
					>
						you@example.com
					</a>{" "}
					— or find me on social media through the links in the footer.
				</p>
			</section>
		</div>
	);
};
