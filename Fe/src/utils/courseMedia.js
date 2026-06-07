import axiosInstance from "@/network/httpRequest";

const COURSE_FALLBACK_THUMB =
    "https://upload.wikimedia.org/wikipedia/commons/1/1c/HSK-logo.jpg";

const API_ORIGIN = (() => {
    const baseURL = axiosInstance.defaults.baseURL || "";
    return baseURL.replace(/\/api\/?$/, "") || "";
})();

const isAbsoluteUrl = (value) =>
    /^https?:\/\//i.test(value) || /^data:/i.test(value) || /^blob:/i.test(value);

export const getCourseImageSrc = (course, fallback = COURSE_FALLBACK_THUMB) => {
    const raw =
        course?.thumbnail ||
        course?.thumb ||
        course?.image ||
        course?.cover ||
        course?.banner ||
        course?.thumbnailUrl ||
        "";

    if (!raw) return fallback;
    if (isAbsoluteUrl(raw)) return raw;

    const normalized = raw.replace(/^\/+/, "");
    return API_ORIGIN ? `${API_ORIGIN}/${normalized}` : `/${normalized}`;
};

export const hasCourseImage = (course) =>
    Boolean(
        course?.thumbnail ||
        course?.thumb ||
        course?.image ||
        course?.cover ||
        course?.banner ||
        course?.thumbnailUrl
    );

export const COURSE_FALLBACK_IMAGE = COURSE_FALLBACK_THUMB;