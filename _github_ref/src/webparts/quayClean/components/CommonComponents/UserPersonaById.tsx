/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prefer-const */
/* eslint-disable no-empty */
import * as React from "react";
import {
    Persona,
    PersonaPresence,
    PersonaSize,
    IPersonaSharedProps,
} from "@fluentui/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import { IDataProvider } from "../../../../DataProvider/Interface/IDataProvider";
import { convertStringToPhoneMask } from "../../../../Common/Util";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { TooltipHost } from "office-ui-fabric-react";
import { useId } from "@fluentui/react-hooks";


interface IUserPersonaByIdProps {
    context: any;
    AuthorId: number;
    provider: IDataProvider;
    personSize?: PersonaSize;
    noText?: string;
    title?: string;
    email?: string;
    className?: string;
    isHoverShow?: boolean;
}

export const UserPersonaById = (props: IUserPersonaByIdProps) => {
    const tooltipId = useId("tooltip");
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [userPersona, setuserPersona] = React.useState<IPersonaSharedProps | undefined>(undefined);

    const getUserProfilePicture = (accountName: string, size?: string | "M") => {
        try {
            return `${props.context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?accountname=${accountName}&size=${size}`;
            // return `${props.context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?accountname=${"krunal.b.patel@treta.onmicrosoft.com"}&size=${"L"}`;
        } catch (ex) {
            console.error("getUserProfilePicture error:", ex);
            return '';
        }
    };

    const fetchImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
        try {
            const response = await fetch(imageUrl, { mode: "cors" });
            if (!response.ok) throw new Error("Failed to fetch image");
            const blob = await response.blob();

            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (err) {
            console.warn("Image fetch failed:", err);
            return null;
        }
    };

    const getUserProfile = async (authorLogin: string) => {
        try {
            const userProfile = await props.provider.getPropertiesFor(authorLogin);

            let POCPhone = "", POCEmail = "", POCTitle = "", POCPictureUrl = "", DisplayName = "", FirstName = "", LastName = "";

            if (userProfile?.UserProfileProperties) {
                userProfile.UserProfileProperties.forEach((prop: any) => {
                    switch (prop.Key) {
                        case "WorkPhone":
                            POCPhone = prop.Value ? convertStringToPhoneMask(prop.Value, "(___) ___ - ____") : "";
                            break;
                        case "WorkEmail":
                            POCEmail = prop.Value;
                            break;
                        case "UserName":
                            POCPictureUrl = getUserProfilePicture(prop.Value, "L");
                            break;
                        case "Title":
                            POCTitle = prop.Value;
                            break;
                        case "FirstName":
                            FirstName = prop.Value;
                            break;
                        case "LastName":
                            LastName = prop.Value;
                            break;
                    }
                });
            }

            DisplayName = userProfile?.DisplayName || `${FirstName} ${LastName}` || "Unknown User";

            let base64Image: string | null = null;
            if (POCPictureUrl) {
                base64Image = await fetchImageAsBase64(POCPictureUrl);
            }

            const fallbackImage = "/_layouts/15/images/person.gif";

            const persona: IPersonaSharedProps = {
                imageUrl: base64Image || POCPictureUrl || fallbackImage,
                text: DisplayName,
                secondaryText: props.email || POCEmail,
                tertiaryText: POCPhone,
                showSecondaryText: true,
            };

            setuserPersona(persona);
        } catch (error) {
            console.error("getUserProfile failed:", error);
            setuserPersona(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    const resolveUser = async () => {
        try {
            if (props.AuthorId) {
                const user = await props.provider.getUserName(props.AuthorId);
                if (user?.LoginName) {
                    await getUserProfile(user.LoginName);
                } else {
                    console.warn("User LoginName not found.");
                    setuserPersona(undefined);
                }
            }
        } catch (err) {
            console.error("resolveUser failed:", err);
            setuserPersona(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        const run = async () => {
            if (!!props.AuthorId && props.AuthorId > 0) {
                setIsLoading(true);
                await resolveUser();
            } else {
                console.warn("Invalid AuthorId", props.AuthorId);
                setuserPersona(undefined);
            }
        };

        void run();
    }, [props.AuthorId]);

    return (
        <React.Fragment>
            <LazyLoadComponent>
                <div className={props.className ? props.className : ""}>
                    {isLoading ? (
                        <div>
                            <span style={{ width: "75px" }}>
                                <FontAwesomeIcon className="spinerColor" icon={faSpinner} spin />
                            </span>
                        </div>
                    ) : !!userPersona ? (
                        props.isHoverShow ? (
                            <TooltipHost
                                id={tooltipId}
                                content={
                                    <Persona
                                        {...userPersona}
                                        size={PersonaSize.size100}
                                        presence={PersonaPresence.none}
                                    />
                                }
                            >
                                <div>
                                    <Persona
                                        text={userPersona.text || ""}
                                        imageUrl={userPersona.imageUrl || ""}
                                        imageAlt="IMG"
                                        size={PersonaSize.size24}
                                        presence={PersonaPresence.none}
                                    />
                                </div>
                            </TooltipHost>
                        ) : (
                            <Persona
                                {...userPersona}
                                size={
                                    !!props.personSize
                                        ? props.personSize
                                        : PersonaSize.size100
                                }
                                presence={PersonaPresence.none}
                            />
                        )
                    ) : (
                        <div className="noUserFound detailpageBadge">
                            {!!props.noText ? props.noText : "No user available"}
                        </div>
                    )}
                </div>
            </LazyLoadComponent>
        </React.Fragment>
    );
};
