import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../lib/api";
import Button from "../components/Button";
import FormField from "../components/FormField";
import TextArea from "../components/TextArea";

export default function EditPost() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [title, setTitle] = useState("");
	const [slug, setSlug] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [content, setContent] = useState("");
	const [err, setErr] = useState("");
	const [fieldErrors, setFieldErrors] = useState({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const data = await authFetch(`/api/posts/id/${id}`);
				setTitle(data.title || "");
				setSlug(data.slug || "");
				setExcerpt(data.excerpt || "");
				setContent(data.content || "");
			} catch (e) {
				console.error(e);
				setErr(e.message || "Error loading post");
			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

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
		setSaving(true);

		try {
			await authFetch(`/api/posts/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title, slug, excerpt, content }),
			});
			navigate("/admin/posts", { replace: true });
		} catch (error) {
			console.error(error);
			
			if (error?.details?.length) {
				const fe = {};
				for (const d of error.details) {
					if (d?.param && d?.msg) fe[d.param] = d.msg;
				}
				setFieldErrors(fe);
			}
			setErr(error.message || "Error updating post");
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <p>Loading…</p>;

	return (
		<div className="max-w-2xl mx-auto mt-10">
			<h2 className="text-2xl font-bold mb-4">Edit Post</h2>
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
					<Button type="submit" disabled={saving}>
						{saving ? "Saving…" : "Save Changes"}
					</Button>
					<Button type="button" variant="outline" onClick={() => navigate(-1)}>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
};
