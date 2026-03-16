/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-void */
import * as React from "react";
import { IQuayCleanState } from "../QuayClean";
import { ComponentNameEnum, ListNames, updateQRUser } from "../../../../Common/Enum/ComponentNameEnum";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IBreadCrum } from "../../../../Interfaces/IBreadCrum";
import { _onItemSelected, encryptValue, logGenerator, mapSingleValue, onBreadcrumbItemClicked } from "../../../../Common/Util";
import IPnPQueryOptions from "../../../../DataProvider/Interface/IPnPQueryOptions";
import { INavigationLinks } from "../../../../Interfaces/INavigationLinks";
import { HoverCard, HoverCardType, IPlainCardProps, Label, Link, Persona, PersonaSize, SelectionMode, TeachingBubble, TooltipHost, mergeStyles } from "@fluentui/react";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { DataType, ExtraNavBar, WHSChairpersonOnlyMenu, WHSUserNavBarName } from "../../../../Common/Constants/CommonConstants";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../jotai/appGlobalStateAtom";
import CamlBuilder from "camljs";
import { faBinoculars, faPersonWalkingArrowLoopLeft, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import CustomModal from "./CustomModal";
// import { Loader } from "./Loader";
// import { ViewSiteImage } from "./ViewSiteImage";
// import { UserPersonaById } from "./UserPersonaById";
// import { MemoizedDetailList } from "../../../../Common/DetailsList";
import { SitePageName } from "../../../../Common/Enum/WasteReportEnum";
import { SiteFilterClientView } from "../../../../Common/Filter/SiteFilterClientView";
const notFoundImage = require('../../assets/images/sitelogo.jpg');

export interface IHeaderComponentProps {
    manageComponentView(componentProp: IQuayCleanState): any;
    componentProps: IQuayCleanState;
    onClickNav(currentNave: string, id: string, activeName: string[], isChild?: boolean): any;
    isShowQRCode: any;
    siteId?: any;
    isClientView?: boolean;
}

export interface IHeaderComponentState {
    navLinksItems: INavigationLinks[];
    isClientViewModelShow: boolean;
    selectedSite: any;


}

export interface IcurrentloginDetails {
    admin: any;
    siteManger: any;
    user: any;
    title: string;
    emailId: string;
    Id: any;
    arrayofPremission: any;
    isSiteSupervisor: any;
    isStateManager: any;
    PermissionArray?: any;
}

export const HeaderComponent = (props: IHeaderComponentProps) => {

    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;

    const [state, setState] = React.useState<IHeaderComponentState>({
        isClientViewModelShow: false,
        navLinksItems: [],
        selectedSite: ""
    });
    const [teachingBubbleVisible, { toggle: toggleTeachingBubbleVisible }] = useBoolean(false);
    const userDetails = React.useRef<any>(null);
    const buttonId = useId('targetButton');
    const tooltipId = useId('tooltip');
    const itemClass = mergeStyles({
        selectors: {
        },
        height: "125px",
        width: "320px"
    });

    const onRenderPlainCard = (): JSX.Element => {
        return <div className={itemClass} >
            <div className="ms-SPLegacyFabricBlock">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        {currentUserRoleDetail?.isAdmin ?
                            <><div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6 ">
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
                            </div>

                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6 text-right ">
                                    <a href={`https://login.windows.net/common/oauth2/logout?post_logout_redirect_uri=${context.pageContext.web.absoluteUrl}`}><button style={{ height: "40px", border: "0px", background: "rgba(0,0,0,.08)" }}> Sign out</button></a>
                                </div>
                            </>
                            : <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 text-right ">
                                <a href={`https://login.windows.net/common/oauth2/logout?post_logout_redirect_uri=${context.pageContext.web.absoluteUrl}`}><button style={{ height: "40px", border: "0px", background: "rgba(0,0,0,.08)" }}> Sign out</button></a>
                            </div>
                        }
                        <div className="userHover">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                <img src={window.location.origin + "/_layouts/15/userPhoto.aspx?accountName=" + userDetails.current?.email + "&Size=l"} className="user-picHover" alt="user" />
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg8 mt-20">
                                <div className="ms-Grid">
                                    <div className="ms-Grid-row">
                                        <div className="ms-Grid-col ms-sm12 ms-md8 ms-lg12 ">
                                            <div className="truncate" style={{ fontSize: "18px", fontWeight: "700" }}>
                                                {userDetails.current?.displayName}</div>
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                            <TooltipHost content={userDetails.current?.email} id={tooltipId}>
                                                <div className="truncate">{userDetails.current?.email}</div>
                                            </TooltipHost>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </div>
        </div >;
    };

    const plainCardProps: IPlainCardProps = {
        onRenderPlainCard: onRenderPlainCard,
    };


    const onClickMoblie = (): void => {
        const value: any = document.getElementById('mobileNav');
        if (value.checked)
            value.checked = !value.checked;
    };

    const getNavlinks = async () => {
        try {
            // const filter = `IsActive eq 1 and LinkFor eq 'Client Dashboard'`;
            // const queryOptions: IPnPQueryOptions = {
            //     listName: ComponentNameEnum.NavigationLinks,
            //     select: ['Title,NavType,URL,ComponentName,QROrder,IsActive,IsLabel,Parent,TargetAudience'],
            //     // select: ['*'],
            //     filter: filter,
            //     orderBy: "QROrder"
            // };

            const camelQuery = new CamlBuilder()
                .View([])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query()
                .Where()
                .BooleanField('IsActive').IsTrue()
                .And()
                .ChoiceField('LinkFor')
                .EqualTo('Client Dashboard')
                .ToString();

            let data = await provider.getItemsByCAMLQuery(ListNames.NavigationLinks, camelQuery, { SortField: "QROrder", SortDir: "Asc" })
            let navLinks: any[] = [];
            if (!!data && data.length > 0) {
                navLinks = data.map((i) => {
                    return {
                        Title: mapSingleValue(i.Title, DataType.string),
                        NavType: mapSingleValue(i.NavType, DataType.string),
                        URL: mapSingleValue(i.URL, DataType.string),
                        ComponentName: mapSingleValue(i.ComponentName, DataType.string),
                        QROrder: mapSingleValue(i.QROrder, DataType.string),
                        IsActive: mapSingleValue(i.IsActive, DataType.YesNoTrue),
                        IsLabel: mapSingleValue(i.IsLabel, DataType.YesNoTrue),
                        Parent: mapSingleValue(!!i.Parents ? i.Parents : i.Parent, !!i.Parents ? DataType.lookupValue : DataType.string),
                        TargetAudience: mapSingleValue(i.TargetAudience, DataType.ChoiceMultiple),
                    }
                })
            }
            let navLink = navLinks;

            // const navLinksData = await provider.getItemsByQuery(queryOptions);
            // let navLink = navLinksData.map((i: any) => {
            //     return {
            //         Title: !!i.Title ? i.Title : "",
            //         NavType: !!i.NavType ? i.NavType : "",
            //         URL: !!i.URL ? i.URL.Url : "",
            //         ComponentName: !!i.ComponentName ? i.ComponentName : "",
            //         QROrder: !!i.QROrder ? i.QROrder : 0,
            //         IsActive: !!i.IsActive ? i.IsActive : false,
            //         IsLabel: !!i.IsLabel ? i.IsLabel : false,
            //         Parent: !!i.Parent ? i.Parent : "",
            //         TargetAudience: !!i.TargetAudience ? i.TargetAudience : []
            //     };
            // });
            const userName = (context.pageContext.user?.loginName)?.toLocaleLowerCase();
            if (updateQRUser?.includes(userName) && props.isShowQRCode == "true") {
                navLink?.push(ExtraNavBar);
            }

            // check is this chair person 
            if (currentUserRoleDetail.isWHSChairperson == false) {
                navLink = navLink.filter((i) => i.Title != WHSUserNavBarName)
            }
            // else if (currentUserRoleDetail.isWHSChairperson == true && currentUserRoleDetail.isShowOnlyChairPerson) {
            //     navLink = navLink.filter((i) => WHSChairpersonOnlyMenu.indexOf(i.Title) > -1)
            // }

            setState(prevState => ({ ...prevState, navLinksItems: navLink }));
        } catch (error) {
            const errorObj = { ErrorMethodName: "getNavlinks", CustomErrormessage: "error in get Nav links", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };




    const onClickClientViewClose = async () => {
        setState((prevState) => ({
            ...prevState, isClientViewModelShow: !prevState.isClientViewModelShow,
            // selectedSite: prevState.isClientViewModelShow == false ? "" : prevState.selectedSite
        }));



    }

    const onClickYesClientView = () => {
        if (state.selectedSite) {
            let clientViewUrl = `${context.pageContext.web.absoluteUrl}/SitePages/${SitePageName.QuayClean}?SiteId=${encryptValue(state.selectedSite)}&isClientView=true`;
            window.open(clientViewUrl, '_blank');
            setState((prevState) => ({ ...prevState, isClientViewModelShow: !prevState.isClientViewModelShow, selectedSite: "" }));
        }
    }


    const onChangeSite = (sites: any) => {
        if (!!sites?.value) {
            setState((prevState) => ({ ...prevState, selectedSite: sites.value }))
        }


    }

    const renderModelMessage = <div className="viewClientAsDesign">
        <div>
            Please select a site to view the application as a client.
        </div>
        <Label className="labelForm">Sites</Label>
        <SiteFilterClientView
            isPermissionFiter={true}
            loginUserRoleDetails={currentUserRoleDetail}
            selectedSite={state.selectedSite}
            onSiteChange={onChangeSite} provider={provider}
        />
    </div>;

    const onClickExistClientView = () => {
        const url = window.location.origin + window.location.pathname;
        window.location.href = url;

    }



    React.useEffect(() => {
        setTimeout(() => {
            const subMenus = document.querySelectorAll(".dropdown-submenu > .dropdown-content");
            subMenus.forEach((submenu) => {
                submenu.addEventListener("mouseenter", () => {
                    const rect = submenu.getBoundingClientRect();
                    if (rect.right > window.innerWidth - 50) {
                        submenu.classList.add("dropdown-flip-left");
                    } else {
                        submenu.classList.remove("dropdown-flip-left");
                    }
                });
            });
        }, 500);

    }, []);


    React.useEffect(() => {
        void (async () => {
            userDetails.current = currentUser;
            await getNavlinks();
            props.onClickNav("Home", "home", []);
        })();
    }, []);

    return <>
        {teachingBubbleVisible && (
            <TeachingBubble
                target={`#${buttonId}`}
                onDismiss={toggleTeachingBubbleVisible}
            >
                {onRenderPlainCard()}
            </TeachingBubble>
        )}

        {state.isClientViewModelShow && <CustomModal
            isBlocking={true}
            isYesButtonDisbale={!!state.selectedSite ? false : true}
            isModalOpenProps={state.isClientViewModelShow || false}
            subject={"View Application as Client"}
            message={renderModelMessage}
            onClickOfYes={onClickYesClientView}
            onClose={onClickClientViewClose}
            yesButtonText="View as Client"
            closeButtonText="Cancel"
        // thirdButtonText="Exit Client View"
        // onClickThirdButton={props.isClientView ? onClickExistClientView : undefined}

        />}

        <nav className="nav fixedTop">
            <input type="checkbox" id="nav-check" />
            <div className="navHeader">
                <div className="navBrand" onClick={(e) => {
                    props.onClickNav("Home", "home", []);
                    props.manageComponentView({ currentComponentName: ComponentNameEnum.DashBoard });
                }}>
                    <img src={require('../../assets/images/logo.png')} alt="Quayclean logo" className="brandLogo" />
                </div>
            </div>
            <div className="nav-btn">
                <div id="menuToggle" style={{ marginRight: "35px", marginBottom: '50px' }}>
                    <input type="checkbox" id="mobileNav" />

                    <span />
                    <span />
                    <span />
                    <span />
                    {/* For mobile view Start nav bar */}
                    <ul id="menu">
                        {state.navLinksItems.length > 0 && <>
                            {state.navLinksItems.map((items: INavigationLinks) => {
                                let isVisibleNavBar: boolean = true;
                                let permissionaItems: any[] = [];
                                for (let index = 0; index < items.TargetAudience.length; index++) {
                                    currentUserRoleDetail.userRoles.indexOf(items.TargetAudience[index]) > -1 ? permissionaItems.push(items.TargetAudience[index]) : [];
                                }
                                isVisibleNavBar = (permissionaItems.length > 0 || items.TargetAudience.length == 0);
                                if (!!items.Title) {
                                    if (!!items.IsLabel) {
                                        return <></>;
                                    } else {
                                        if (!!items.Parent) {
                                            if (isVisibleNavBar)
                                                if (items.NavType == "Link") {
                                                    return <li id={items.Title.split(" ").join("")} onClick={() => { window.open(`${items.URL}`, '_blank'); }}>
                                                        {items.Title}
                                                    </li>
                                                } else {
                                                    return <>
                                                        <li>
                                                            <a onClick={(e) => {
                                                                onClickMoblie();
                                                                const breadCrumItems: IBreadCrum[] = [{
                                                                    text: `${items.ComponentName}`,
                                                                    key: `${items.ComponentName}`,
                                                                    currentCompomnetName: items.ComponentName,
                                                                    onClick: onBreadcrumbItemClicked,
                                                                    manageComponent: props.manageComponentView,
                                                                    manageCompomentItem: { currentComponentName: items.ComponentName }
                                                                }];
                                                                props.manageComponentView({ currentComponentName: items.ComponentName, breadCrumItems: breadCrumItems });

                                                            }}>
                                                                {items.Title}
                                                            </a>
                                                        </li>
                                                    </>;
                                                }

                                        } else if (items.NavType == "Link") {
                                            if (isVisibleNavBar)
                                                return <>
                                                    <li id={items.Title.toLowerCase()} ><a href={items.URL} target="_blank">{items.Title}</a></li>
                                                </>;
                                        }
                                        else {
                                            if (isVisibleNavBar)
                                                return <>
                                                    <li><a onClick={(e) => {
                                                        onClickMoblie();
                                                        const breadCrumItems: IBreadCrum[] = [{ text: `${items.ComponentName}`, key: `${items.ComponentName}`, currentCompomnetName: items.ComponentName, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: items.ComponentName } }];
                                                        props.manageComponentView({ currentComponentName: items.ComponentName, breadCrumItems: breadCrumItems });
                                                    }}>{items.Title}</a></li>
                                                </>;
                                        }

                                    }
                                }
                            })}
                        </>}

                    </ul>
                    {/* For mobile view end nav bar */}
                </div>
            </div>
            <div className="navbarCollapse">
                <ul className="navList">
                    {state.navLinksItems.length > 0 &&
                        state.navLinksItems
                            .filter((item) => !item.Parent) // level-0
                            .map((parent) => {
                                const renderNavItem = (item: INavigationLinks, level: number = 0) => {
                                    // ---------------------
                                    // Permission logic
                                    // ---------------------
                                    let permissionItems: string[] = [];
                                    for (let i = 0; i < item.TargetAudience.length; i++) {
                                        if (currentUserRoleDetail.userRoles.indexOf(item.TargetAudience[i].trim()) > -1) {
                                            permissionItems.push(item.TargetAudience[i]);
                                        }
                                    }
                                    const isVisible = permissionItems.length > 0 || item.TargetAudience.length === 0;
                                    if (!isVisible || !item.Title) return null;

                                    // ---------------------
                                    // Find children
                                    // ---------------------
                                    const children = state.navLinksItems.filter((c) => c.Parent === item.Title);
                                    const hasChildren = children.length > 0;

                                    // ---------------------
                                    // Level-0 / parent (IsLabel) → keep existing
                                    // ---------------------
                                    if (item.IsLabel) {
                                        return (
                                            <li className="dropbtn" key={item.Title} id={item.Title.toLowerCase()}>
                                                <div className="dropdown">
                                                    {item.Title} <FontAwesomeIcon icon="caret-down" style={{ marginLeft: "5px" }} />
                                                    {hasChildren && (
                                                        <ul className="dropdown-content">
                                                            {children.map((child) => renderNavItem(child, level + 1))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    }

                                    // ---------------------
                                    // Level-1 items
                                    // ---------------------
                                    if (level === 1) {
                                        if (hasChildren) {
                                            // Level-1 item with sub-child
                                            return (
                                                <li className="child-hover" key={item.Title} id={item.Title.toLowerCase()}>
                                                    <a>
                                                        {item.Title} <FontAwesomeIcon icon="caret-right" />
                                                    </a>
                                                    <ul className="sub-child">
                                                        {children.map((sub) => {
                                                            // Sub-child permission
                                                            const subIsVisible =
                                                                !sub.TargetAudience ||
                                                                sub.TargetAudience.length === 0 ||
                                                                sub.TargetAudience.some((role) =>
                                                                    currentUserRoleDetail.userRoles.includes(role.trim())
                                                                );
                                                            if (!subIsVisible || !sub.Title) return null;

                                                            return (
                                                                <li
                                                                    key={sub.Title}
                                                                    id={sub.Title.toLowerCase()}
                                                                    className="sub-child-label"
                                                                    onClick={() => {
                                                                        if (sub.NavType === "Link") {
                                                                            window.open(sub.URL, "_blank");
                                                                        } else {
                                                                            const breadCrumItems: IBreadCrum[] = [
                                                                                {
                                                                                    text: sub.Title,
                                                                                    key: sub.Title,
                                                                                    currentCompomnetName: sub.ComponentName,
                                                                                    onClick: onBreadcrumbItemClicked,
                                                                                    manageComponent: props.manageComponentView,
                                                                                    manageCompomentItem: { currentComponentName: sub.ComponentName },
                                                                                },
                                                                            ];
                                                                            props.onClickNav(sub.Title, sub.Title.split(" ").join(""), [item?.Parent, item.Title, sub.Title], true);
                                                                            props.manageComponentView({
                                                                                currentComponentName: sub.ComponentName,
                                                                                breadCrumItems,
                                                                            });
                                                                        }
                                                                    }}
                                                                >
                                                                    {sub.Title}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </li>
                                            );
                                        } else {
                                            // Level-1 item without children
                                            return (
                                                <li key={item.Title} id={item.Title.toLowerCase()}>
                                                    {item.NavType === "Link" ? (
                                                        <a onClick={() => window.open(item.URL, "_blank")}>
                                                            {item.Title}
                                                        </a>
                                                    ) : (
                                                        <a
                                                            onClick={() => {
                                                                props.onClickNav(item.Title, item.Title.toLowerCase(), [item.Parent, item.Title], true);
                                                                props.manageComponentView({ currentComponentName: item.ComponentName });
                                                            }}
                                                        >
                                                            {item.Title}
                                                        </a>
                                                    )}
                                                </li>
                                            );
                                        }
                                    }

                                    // ---------------------
                                    // Fallback for level >1 items without children
                                    // ---------------------
                                    if (!hasChildren) {
                                        return (
                                            <li key={item.Title} id={item.Title.toLowerCase()}>
                                                {item.NavType === "Link" ? (
                                                    <a onClick={() => window.open(item.URL, "_blank")}>
                                                        {item.Title}
                                                    </a>
                                                ) : (
                                                    <a
                                                        onClick={() => {
                                                            props.onClickNav(item.Title, item.Title.toLowerCase(), []);
                                                            props.manageComponentView({ currentComponentName: item.ComponentName });
                                                        }}
                                                    >
                                                        {item.Title}
                                                    </a>
                                                )}
                                            </li>
                                        );
                                    }

                                    return null;
                                };

                                return renderNavItem(parent, 0);
                            })}
                </ul>


                {false && <div className="userDropdownItem">
                    <HoverCard plainCardProps={plainCardProps} instantOpenOnClick type={HoverCardType.plain}>
                        <img src={window.location.origin + "/_layouts/15/userPhoto.aspx?accountName=" + userDetails.current?.email + "&Size=S"} className="user-pic" alt="user" />
                    </HoverCard>

                </div>}
                {((currentUserRoleDetail?.isAdminOrg || currentUserRoleDetail?.isStateManagerOrg || currentUserRoleDetail?.isSiteManagerOrg || currentUserRoleDetail?.isSiteSupervisorOrg) && props.isClientView) && <Link className="actionBtn btn-red dticon" target="_blank" rel="noopenernoreferrer"
                    //  onClick={() => { window.open(`${context.pageContext.web.absoluteUrl}/_layouts/15/settings.aspx`, '_blank'); }}  
                    onClick={onClickExistClientView}  >
                    <TooltipHost
                        content={"Exit Client View"}
                        id={tooltipId}
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                    </TooltipHost>

                </Link>
                }
                {(currentUserRoleDetail?.isAdmin ||
                    currentUserRoleDetail?.isStateManager ||
                    currentUserRoleDetail?.isSiteManager ||
                    currentUserRoleDetail?.isSiteSupervisor ||
                    props.isClientView) && <Link className="actionBtn btnView dticon" target="_blank" rel="noopenernoreferrer"
                        //  onClick={() => { window.open(`${context.pageContext.web.absoluteUrl}/_layouts/15/settings.aspx`, '_blank'); }}  
                        onClick={onClickClientViewClose}  >
                        <TooltipHost
                            content={"Client View"}
                            id={tooltipId}
                        >
                            <FontAwesomeIcon icon={faBinoculars} />
                        </TooltipHost>

                    </Link>
                }


                <div className="userDropdownItem" onClick={() => toggleTeachingBubbleVisible()}>
                    <img id={buttonId} src={window.location.origin + "/_layouts/15/userPhoto.aspx?accountName=" + userDetails.current?.email + "&Size=S"} className="user-pic" alt="user" />
                </div>
            </div>
        </nav >
    </>;

};