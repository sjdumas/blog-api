import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { authHeaders, clearAuth } from "../lib/auth";
import Button from "../components/Button";
import FormField from "../components/FormField";
import TextArea from "../components/TextArea";

export default function NewPost() {
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [content, setContent] = useState("");
	const [err, setErr] = useState("");
	const [fieldErrors, setFieldErrors] = useState({});
	const [loading, setLoading] = useState(false);

	const autoSlug = () => {
		if (!title.trim()) return;
		const s = title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.trim()
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");
		setSlug(s);
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		setErr("");
		setFieldErrors({});
		setLoading(true);

		try {
			const res = await fetch(`${API_BASE}/api/posts`, {
				method: "POST",
				headers: authHeaders({ "Content-Type": "application/json" }),
				body: JSON.stringify({ title, slug, excerpt, content }),
			});

			if (res.status === 401) {
				clearAuth();
				window.location.assign("/login");
				return;
			}

			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				if (res.status === 409 && data?.error?.toLowerCase().includes("duplicate")) {
					setFieldErrors((fe) => ({ ...fe, slug: "This slug is already in use. Try another." }));
					setErr("Duplicate slug. Please choose a different one.");
				} else if (res.status === 400 && data?.details?.length) {
					const fe = {};
					for (const d of data.details) {
						if (d?.param && d?.msg) fe[d.param] = d.msg;
					}
					setFieldErrors(fe);
					setErr(data.error || "Please fix the highlighted fields.");
				} else {
					setErr(data?.error || `Failed to create post (${res.status})`);
				}
				return;
			}

			navigate("/admin/posts", { replace: true });
		} catch (error) {
			console.error(error);
			setErr(error.message || "Error creating post");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto mt-10">
			<h2 className="text-2xl font-bold mb-4">New Post</h2>
			{err && <p className="text-red-600 mb-3">{err}</p>}

			<form onSubmit={onSubmit} className="space-y-3">
				<FormField
					label="Title"
					name="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					onBlur={autoSlug}
					required
					error={fieldErrors.title}
				/>

				<div>
					<div className="grid grid-cols-12 gap-3 items-center">
						<div className="col-span-10">
							<FormField
								label="Slug"
								name="slug"
								placeholder="kebab-case-slug"
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								onBlur={autoSlug}
								required
								error={fieldErrors.slug}
							/>
						</div>
						<div className="col-span-2 w-full md:w-auto">							
							<Button type="button" className="!mt-3" variant="outline" onClick={autoSlug}>
								Auto
							</Button>
						</div>
					</div>
					<p className="text-xs text-gray-500 mt-1">
						lowercase letters, numbers, and dashes only
					</p>
				</div>

				<FormField
					label="Excerpt (optional)"
					name="excerpt"
					value={excerpt}
					onChange={(e) => setExcerpt(e.target.value)}
					maxLength={300}
					error={fieldErrors.excerpt}
				/>

				<TextArea
					label="Content"
					name="content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					required
					error={fieldErrors.content}
				/>

				<div className="flex gap-3">
					<Button type="submit" disabled={loading}>
						{loading ? "Creating…" : "Create Post"}
					</Button>

					<Button type="button" variant="outline" onClick={() => navigate(-1)}>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
};
