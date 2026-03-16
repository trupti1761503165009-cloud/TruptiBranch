import { IPlainCardProps, Link, TeachingBubble, TooltipHost, mergeStyles } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId, useBoolean } from "@uifabric/react-hooks";
import { useAtom } from "jotai";
import { ComponentName } from "../../../../Shared/Enum/ComponentName";
import { appGlobalStateAtom } from "../../../../jotai/appGlobalStateAtom";
import * as React from "react";



export interface INavItem {
    name: string;
    hasChild?: boolean;
    childItems?: string[] | any;
}

export interface IHeaderComponentProps {
    loadComponent: (_componentName: string, _prevComponentName?: string, itemId?: number) => void;
    currentView: string;
    linkItems: INavItem[];
}

export const Header = React.memo(({ loadComponent, currentView, linkItems }: IHeaderComponentProps) => {
    const tooltipId = useId('tooltip');
    const buttonId = useId('button');
    const [teachingBubbleVisible, setTeachingBubbleVisible] = React.useState(false);
    const [appglobalState] = useAtom(appGlobalStateAtom);
    const { context, currentUser, provider } = appglobalState;
    const pageURL = context?.pageContext.web.absoluteUrl;
    const itemClass = mergeStyles({
        selectors: {
        },
        height: "125px",
        width: "320px"
    });
    // console.log(currentUser);

    const handleToggleTeachingBubble = () => {
        setTeachingBubbleVisible((prev: any) => !prev);
    };

    // const onRenderPlainCard = (): JSX.Element => {
    //     return (
    //         <div className="card-container">
    //             <div className="card-header dflex space-between align-center mb-20">
    //                 <div className="dflex align-center gap-10">
    //                     <a
    //                         className="btn-icon"
    //                         target="_blank"
    //                         rel="noopener noreferrer"
    //                         onClick={() => {
    //                             window.open(
    //                                 `${context.pageContext.web.absoluteUrl}/_layouts/15/settings.aspx`,
    //                                 '_blank'
    //                             );
    //                         }}
    //                     >
    //                         <TooltipHost content="Site Setting" id={tooltipId}>
    //                             <FontAwesomeIcon className="icon" icon="gear" />
    //                         </TooltipHost>
    //                     </a>
    //                     <a
    //                         className="btn-icon"
    //                         target="_blank"
    //                         rel="noopener noreferrer"
    //                         onClick={() => {
    //                             window.open(
    //                                 `${context.pageContext.web.absoluteUrl}/_layouts/15/viewlsts.aspx`,
    //                                 '_blank'
    //                             );
    //                         }}
    //                     >
    //                         <TooltipHost content="Site Content" id={tooltipId}>
    //                             <FontAwesomeIcon className="icon" icon="bars" />
    //                         </TooltipHost>
    //                     </a>
    //                 </div>
    //                 <div>
    //                     <a
    //                         href={`https://login.windows.net/common/oauth2/logout?post_logout_redirect_uri=${context.pageContext.web.absoluteUrl}`}
    //                     >
    //                         <button className="btn-outline">Sign out</button>
    //                     </a>
    //                 </div>
    //             </div>

    //             <div className="user-profile dflex align-center">
    //                 <img
    //                     src={`${window.location.origin}/_layouts/15/userPhoto.aspx?accountName=${currentUser?.email}&Size=l`}
    //                     className="user-avatar"
    //                     alt="user"
    //                 />
    //                 <div className="ml-15">
    //                     <div className="user-name bold">{currentUser?.displayName}</div>
    //                     <TooltipHost content={currentUser?.email} id={tooltipId}>
    //                         <div className="user-email truncate">{currentUser?.email}</div>
    //                     </TooltipHost>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // };
    const onRenderPlainCard = (): JSX.Element => {
        return <div className={itemClass} >
            <div className="ms-SPLegacyFabricBlock">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">


                        <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 ">
                            {/* {
                                <div className="dflex">
                                    <Link className="actionBtn btnView dticon" target="_blank" rel="noopenernoreferrer" onClick={() => { window.open(`${context.pageContext.web.absoluteUrl}/_layouts/15/settings.aspx`, '_blank'); }}  >
                                        <TooltipHost
                                            content={"Site Setting"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon className="quickImg " icon={"gear"} />
                                        </TooltipHost>

                                    </Link>
                                    <Link className="actionBtn btnView dticon" target="_blank" rel="noopenernoreferrer" onClick={() => { window.open(`${context.pageContext.web.absoluteUrl}/_layouts/15/viewlsts.aspx`, '_blank'); }}   >
                                        <TooltipHost
                                            content={"Site Content"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon className="quickImg " icon={"bars"} />
                                        </TooltipHost>

                                    </Link>
                                </div>
                            } */}
                        </div>


                        <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 justifyright ">
                            <a href={`https://login.windows.net/common/oauth2/logout?post_logout_redirect_uri=${context.pageContext.web.absoluteUrl}`}><button style={{ height: "40px", border: "0px", background: "rgba(0,0,0,.08)" }}> Sign out</button></a>
                        </div>
                        <div className="userHover">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                <img
                                    src={`${window.location.origin}/_layouts/15/userPhoto.aspx?accountName=${currentUser?.email}&Size=l`}
                                    className="user-picHover"
                                    alt="user"
                                />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg8 mt-20">
                                <div className="ms-Grid">
                                    <div className="ms-Grid-row">
                                        <div className="ms-Grid-col ms-sm12 ms-md8 ms-lg12 ">
                                            <div className="truncate" style={{ fontSize: "18px", fontWeight: "700" }}>{currentUser?.displayName}</div>
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                            <TooltipHost content={currentUser?.email} id={tooltipId}>
                                                <div className="truncate">{currentUser?.email}</div>
                                            </TooltipHost>
                                        </div>
                                        {/* <div className="ms-Grid-col ms-sm12 ms-md8 ms-lg12 ">
                                            <a className='editProfile' onClick={_onClickProfilePopup}>Edit Profile</a>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 mt-20">
                        <a href="https://www.office.com/login?prompt=select_account&ru=%2Flaunch%2Fsharepoint" target="_top"><button style={{ height: "40px", width: "100%", border: "0px", background: "white", }} className="userButton"> <FontAwesomeIcon icon={"user-plus"} size="2x" style={{ marginRight: "10px", opacity: "40%" }} />Sign in with different account</button></a>
                    </div> */}
                    </div>
                </div >
            </div>
        </div >;
    };

    const plainCardProps: IPlainCardProps = {
        onRenderPlainCard: onRenderPlainCard,
    };

    return (
        <>

            <div id="navbar" className="Navbar ms-Grid">
                <div className="ms-Grid-row w-100">
                    <div className="ms-Grid-col ms-sm2 ms-lg2 ms-xl2 justify-content-start">
                        <div className="ms-Grid-col ms-sm10 ms-lg10 ms-xl10">
                            <img src={require("../../../assets/Images/HRMS.png")} height={"35px"} />
                        </div>
                    </div>

                    {teachingBubbleVisible && (
                        <TeachingBubble
                            target={`#${buttonId}`}
                            onDismiss={() => {
                                setTimeout(() => setTeachingBubbleVisible(false), 300);
                                console.log("Teaching Bubble dismissed");
                            }}
                        >
                            {onRenderPlainCard()}
                        </TeachingBubble>
                    )}


                    <div className=" ms-Grid-col ms-lg8 Navbar-menu-center">
                        <ul className="ItemList">
                            {linkItems?.map((navItem: INavItem, index: number) => {
                                const isActive =
                                    currentView === navItem.name ||
                                    (navItem.childItems && navItem.childItems.includes(currentView));
                                return (
                                    <li key={`nav${index}`} className={`ItemList ${isActive ? "active" : ""}`}>
                                        {navItem.hasChild ? (
                                            <div className="dropdown">
                                                {navItem.name}
                                                <FontAwesomeIcon icon={"caret-down"} style={{ marginLeft: "5px" }} />
                                                <ul className="dropdown-content" id="myDropdown">
                                                    {navItem.childItems?.map((item: string, idx: number) => (
                                                        <li key={`nav-child${idx}`} className={currentView === item ? "active" : ""}>
                                                            <a onClick={() => loadComponent(item)}>{item}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <a onClick={() => loadComponent(navItem.name)}>{navItem.name}</a>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    {
                        <div className="ms-Grid-col ms-sm2 ms-lg2 ms-xl2 profile-user">
                            <div id={buttonId} className="navuser " onClick={handleToggleTeachingBubble}>
                                <img src={window.location.origin + "/_layouts/15/userPhoto.aspx?accountName=" + currentUser?.email}
                                    className="profileImage" alt="user" height={"35px"} />
                                <span className="navusername">{!!currentUser?.email ? currentUser?.displayName : ""}
                                </span>
                            </div>
                        </div>}
                </div>
            </div>
        </>
    );

});