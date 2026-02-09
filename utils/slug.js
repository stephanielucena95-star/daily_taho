
export function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces/dashes)
        .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with single dash
        .replace(/^-+|-+$/g, ''); // Trim dashes
}
