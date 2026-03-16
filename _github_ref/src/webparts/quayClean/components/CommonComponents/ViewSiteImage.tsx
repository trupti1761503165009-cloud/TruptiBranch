import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
const notFoundImage = require('../../assets/images/sitelogo.jpg');
export interface IViewSiteImageProps {
    imageUrl: string;
    width: number;
    height: number;
    alt: string;
    className: string;
    item: any;
    prefix: string;
}
// const CACHE_PREFIX = "ViewSiteImage";
const SIX_HOURS = 6 * 60 * 60 * 1000;


interface ICachedImage {
    imageBase64: string;
    cachedAt: number;
}

export const ViewSiteImage1 = (props: IViewSiteImageProps) => {
    const [image, setImage] = React.useState<string>(props?.imageUrl || "");
    const CACHE_PREFIX = props.prefix;


    const loadFromCache = (key: string): ICachedImage | null => {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const parsed: ICachedImage = JSON.parse(raw);
            if (Date.now() - parsed.cachedAt < SIX_HOURS) {
                return parsed;
            } else {
                localStorage.removeItem(key);
                return null;
            }
        } catch {
            return null;
        }
    };


    const saveToCache = (key: string, base64: any) => {
        if (base64.length > 1000000) return; // Don't cache large images to avoid quota
        const item: ICachedImage = {
            imageBase64: base64,
            cachedAt: Date.now(),
        };
        try {
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('LocalStorage quota exceeded, not caching image');
            }
        }
    };

    const fetchImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
        try {
            if (imageUrl.startsWith("data:") || imageUrl.startsWith("blob:") || imageUrl.startsWith("static/") || imageUrl.includes("assets/")) {
                return imageUrl;
            }
            const response = await fetch(imageUrl, { mode: "cors" });
            if (!response.ok) throw new Error("Failed to fetch image");
            const blob = await response.blob();

            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error("Error converting image:", error);
            return null;
        }
    };

    const getImage = async (cacheKey: string) => {
        if (!props.imageUrl) return;
        let base64Image: string | null = await fetchImageAsBase64(props.imageUrl);
        if (base64Image && cacheKey) {
            saveToCache(cacheKey, base64Image);
        }
        setImage(base64Image || notFoundImage);
    };

    const resolveImage = () => {
        const imageName: string = props.imageUrl.split('/').pop() || ""
        const Name: string = props?.item?.Title?.replace(/\s+/g, '') || "Test";
        const Id: number = props?.item?.Id || 1
        const cacheKey = `${CACHE_PREFIX}${Name}-${Id}-imageName`;
        const cached = loadFromCache(cacheKey);
        if (cached) {
            setImage(cached.imageBase64);
            return;
        }
        try {
            getImage(cacheKey);
        } catch (error) {
        }

    }

    React.useMemo(() => {
        if (props.imageUrl) {
            resolveImage();
        }
    }, [props.imageUrl]);


    return <LazyLoadImage src={image || ""}
        width={props.width || 110} height={props.height || 75}
        placeholderSrc={notFoundImage}
        alt={props.alt ? props.alt : "event photo"}
        className={props.className ? props.className : "course-img-first"}
        effect="blur"
    />
}