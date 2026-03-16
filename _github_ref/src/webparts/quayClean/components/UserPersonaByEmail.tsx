/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react-hooks/exhaustive-deps */

import * as React from "react";
import {
    Persona,
    PersonaSize,
    PersonaPresence
} from "@fluentui/react";

interface IUserPersonaProps {
    email: string;
    title: string;
    size?: PersonaSize;
    className?: string;
    showHoverDetail?: boolean;
}

const imageCache: { [key: string]: string } = {};

export const UserPersonaByEmail: React.FC<IUserPersonaProps> = ({
    email,
    title,
    size = PersonaSize.size24,
    className,
    showHoverDetail = false,
}) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [imgUrl, setImgUrl] = React.useState<string | undefined>(undefined);
    const ref = React.useRef<HTMLDivElement>(null);

    const fallbackImg = "/_layouts/15/images/person.gif";

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
        if (!isVisible) return;

        if (imageCache[email]) {
            setImgUrl(imageCache[email]);
        } else {
            const url = `${window.location.origin}/_layouts/15/userPhoto.aspx?accountName=${email}&Size=S`;
            imageCache[email] = url;
            setImgUrl(url);
        }
    }, [isVisible]);

    return (
        <div ref={ref} className={className}>
            <Persona
                text={title}
                imageUrl={imgUrl || fallbackImg}
                secondaryText={showHoverDetail ? email : undefined}
                imageAlt="User Image"
                size={size}
                presence={PersonaPresence.none}
            />
        </div>
    );
};
