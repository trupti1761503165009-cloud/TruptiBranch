import * as React from "react"
import SimpleImageSlider from "react-simple-image-slider";
import IPnPQueryOptions from "../../../../DataProvider/Interface/IPnPQueryOptions";
import { IDataProvider } from "../../../../DataProvider/Interface/IDataProvider";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ListNames } from "../../../../Common/Enum/ComponentNameEnum";
export interface ISliderProps {
    provider: IDataProvider;
    context: WebPartContext
}
export const ImageSliders = (props: ISliderProps) => {
    const [images, setImages] = React.useState<any>([]);
    const [sliderHeight, setSliderHeight] = React.useState(100); // default height

    const getDataDocumentlibrary = async () => {
        const queryOption: IPnPQueryOptions = {
            listName: ListNames.QuaycleanSlider,
            select: ["Id,FileLeafRef,LinkFor"],
            filter: `LinkFor eq 'Client Dashboard'`,
        }
        await props.provider.getAllItems(queryOption).then((resposne: any) => {

            let imageData = resposne.map((i: any) => {
                let imageUrl = `${props.context.pageContext.web.absoluteUrl}/QuaycleanSlider/${i.FileLeafRef.replace(/ /g, "%20")}`;
                return {
                    url: imageUrl
                }
            })
            setImages(imageData);
        });
    }
    React.useEffect(() => {
        getDataDocumentlibrary()
    }, [])

    // Function to update height based on screen width
    const updateHeight = () => {
        const width = window.innerWidth;
        if (width < 768) {
            setSliderHeight(200); // Height for small screens
        } else if (width < 1024) {
            setSliderHeight(300); // Height for medium screens
        } else if (width < 576) {
            setSliderHeight(150);
        } else {
            setSliderHeight(450); // Height for large screens
        }
    };

    // Call updateHeight on mount and window resize
    React.useEffect(() => {
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    return (
        <div>
            {images.length > 0 &&
                <SimpleImageSlider
                    width={"100%"}
                    height={sliderHeight}
                    images={images}
                    showBullets={true}
                    showNavs={true}
                    autoPlay={true}
                    slideDuration={2}
                    autoPlayDelay={3}
                />
            }
        </div>
    )
}