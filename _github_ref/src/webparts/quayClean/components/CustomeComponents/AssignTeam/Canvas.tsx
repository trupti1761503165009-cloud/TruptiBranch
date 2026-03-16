// import React, { useRef, useState } from "react";

// const MultiBlurCanvas = () => {
//     const canvasRef = useRef<any>(null); // <-- canvas ref
//     const [image, setImage] = useState<any>(null); // <-- image state
//     const [isDrawing, setIsDrawing] = useState(false); // <-- drawing state
//     const [start, setStart] = useState<any>({ x: 0, y: 0 }); // <-- starting point
//     const [current, setCurrent] = useState<any>({ x: 0, y: 0 }); // <-- current point
//     const [blurHistory, setBlurHistory] = useState<any[]>([]); // <-- stores history of blurs

//     const handleImageUpload = (e: any) => { // <-- handle file upload
//         const file = e.target.files[0];
//         if (!file) return;

//         const reader = new FileReader();
//         reader.onload = (event: any) => { // <-- handle image load
//             const img = new Image();
//             img.onload = () => {
//                 setImage(img);
//                 const canvas = canvasRef.current;
//                 const ctx = canvas.getContext("2d");
//                 canvas.width = img.width;
//                 canvas.height = img.height;
//                 ctx.clearRect(0, 0, canvas.width, canvas.height);
//                 ctx.drawImage(img, 0, 0);
//             };
//             img.src = event.target.result;
//         };
//         reader.readAsDataURL(file);
//     };

//     const handleMouseDown = (e: any) => {
//         const rect = canvasRef.current.getBoundingClientRect();
//         setStart({
//             x: e.clientX - rect.left,
//             y: e.clientY - rect.top,
//         });
//         setIsDrawing(true);
//     };

//     const handleMouseMove = (e: any) => {
//         if (!isDrawing) return;

//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");
//         const rect = canvas.getBoundingClientRect();
//         const x = e.clientX - rect.left;
//         const y = e.clientY - rect.top;
//         setCurrent({ x, y });

//         if (image) {
//             ctx.drawImage(image, 0, 0); // redraw image for each move
//         }

//         drawPreviousBlurs(ctx); // keep previous blurs
//         drawSelectionRect(ctx, start, { x, y });
//     };

//     const handleMouseUp = () => {
//         setIsDrawing(false);

//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");

//         const x = Math.min(start.x, current.x);
//         const y = Math.min(start.y, current.y);
//         const width = Math.abs(current.x - start.x);
//         const height = Math.abs(current.y - start.y);

//         if (!image || width === 0 || height === 0) return;

//         // Create temp canvas to blur region
//         const tempCanvas = document.createElement("canvas");
//         tempCanvas.width = width;
//         tempCanvas.height = height;
//         const tempCtx = tempCanvas.getContext("2d") as any;

//         tempCtx.filter = "blur(6px)";
//         tempCtx.drawImage(
//             canvas,
//             x, y, width, height,
//             0, 0, width, height
//         );

//         const blurred = tempCtx.getImageData(0, 0, width, height);
//         ctx.putImageData(blurred, x, y);

//         // Save blur history
//         setBlurHistory([
//             ...blurHistory,
//             { x, y, width, height, blurredData: blurred },
//         ]);
//     };

//     const drawSelectionRect = (ctx: any, start: any, end: any) => {
//         const x = start.x;
//         const y = start.y;
//         const width = end.x - start.x;
//         const height = end.y - start.y;
//         ctx.strokeStyle = "red";
//         ctx.lineWidth = 2;
//         ctx.strokeRect(x, y, width, height);
//     };

//     const drawPreviousBlurs = (ctx: any) => {
//         // Draw all previous blurs
//         blurHistory.forEach(({ x, y, width, height, blurredData }) => {
//             ctx.putImageData(blurredData, x, y);
//         });
//     };

//     const undoLastBlur = () => {
//         if (blurHistory.length === 0) return;

//         // Remove the last blur
//         const newBlurHistory = [...blurHistory];
//         newBlurHistory.pop();
//         setBlurHistory(newBlurHistory);

//         // Redraw the canvas without the last blur
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");
//         ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas

//         // Redraw the image
//         if (image) {
//             ctx.drawImage(image, 0, 0);
//         }

//         // Redraw remaining blurred regions
//         drawPreviousBlurs(ctx);
//     };

//     return (
//         <div className="boxCard">
//             <input type="file" accept="image/*" onChange={handleImageUpload} />
//             <button onClick={undoLastBlur}>Undo Last Blur</button>
//             <canvas
//                 ref={canvasRef}
//                 style={{
//                     border: "1px solid black",
//                     marginTop: "10px",
//                     cursor: "crosshair",
//                 }}
//                 onMouseDown={handleMouseDown}
//                 onMouseMove={handleMouseMove}
//                 onMouseUp={handleMouseUp}
//             />
//         </div>
//     );
// };

// export default MultiBlurCanvas;

// --------------------------------------------working start
// import React, { useRef, useState } from "react";

// const MultiBlurCanvas = () => {
//     const canvasRef = useRef<any>(null); // <-- canvas ref
//     const [image, setImage] = useState<any>(null); // <-- image state
//     const [isDrawing, setIsDrawing] = useState(false); // <-- drawing state
//     const [start, setStart] = useState<any>({ x: 0, y: 0 }); // <-- starting point
//     const [current, setCurrent] = useState<any>({ x: 0, y: 0 }); // <-- current point
//     const [blurHistory, setBlurHistory] = useState<any[]>([]); // <-- stores history of blurs
//     const [blurIntensity, setBlurIntensity] = useState<number>(6); // <-- blur intensity state

//     const handleImageUpload = (e: any) => { // <-- handle file upload
//         const file = e.target.files[0];
//         if (!file) return;

//         const reader = new FileReader();
//         reader.onload = (event: any) => { // <-- handle image load
//             const img = new Image();
//             img.onload = () => {
//                 setImage(img);
//                 const canvas = canvasRef.current;
//                 const ctx = canvas.getContext("2d");
//                 canvas.width = img.width;
//                 canvas.height = img.height;
//                 ctx.clearRect(0, 0, canvas.width, canvas.height);
//                 ctx.drawImage(img, 0, 0);
//             };
//             img.src = event.target.result;
//         };
//         reader.readAsDataURL(file);
//     };

//     const handleMouseDown = (e: any) => {
//         const rect = canvasRef.current.getBoundingClientRect();
//         setStart({
//             x: e.clientX - rect.left,
//             y: e.clientY - rect.top,
//         });
//         setIsDrawing(true);
//     };

//     const handleMouseMove = (e: any) => {
//         if (!isDrawing) return;

//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");
//         const rect = canvas.getBoundingClientRect();
//         const x = e.clientX - rect.left;
//         const y = e.clientY - rect.top;
//         setCurrent({ x, y });

//         if (image) {
//             ctx.drawImage(image, 0, 0); // redraw image for each move
//         }

//         drawPreviousBlurs(ctx); // keep previous blurs
//         drawSelectionRect(ctx, start, { x, y });
//     };

//     const handleMouseUp = () => {
//         setIsDrawing(false);

//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");

//         const x = Math.min(start.x, current.x);
//         const y = Math.min(start.y, current.y);
//         const width = Math.abs(current.x - start.x);
//         const height = Math.abs(current.y - start.y);

//         if (!image || width === 0 || height === 0) return;

//         // Create temp canvas to blur region
//         const tempCanvas = document.createElement("canvas");
//         tempCanvas.width = width;
//         tempCanvas.height = height;
//         const tempCtx = tempCanvas.getContext("2d") as any;

//         tempCtx.filter = `blur(${blurIntensity}px)`; // Apply dynamic blur intensity
//         tempCtx.drawImage(
//             canvas,
//             x, y, width, height,
//             0, 0, width, height
//         );

//         const blurred = tempCtx.getImageData(0, 0, width, height);
//         ctx.putImageData(blurred, x, y);

//         // Save blur history
//         setBlurHistory([
//             ...blurHistory,
//             { x, y, width, height, blurredData: blurred, blurIntensity },
//         ]);
//     };

//     const drawSelectionRect = (ctx: any, start: any, end: any) => {
//         const x = start.x;
//         const y = start.y;
//         const width = end.x - start.x;
//         const height = end.y - start.y;
//         ctx.strokeStyle = "red";
//         ctx.lineWidth = 2;
//         ctx.strokeRect(x, y, width, height);
//     };

//     const drawPreviousBlurs = (ctx: any) => {
//         // Draw all previous blurs
//         blurHistory.forEach(({ x, y, width, height, blurredData }) => {
//             ctx.putImageData(blurredData, x, y);
//         });
//     };

//     const undoLastBlur = () => {
//         if (blurHistory.length === 0) return;

//         // Remove the last blur
//         const newBlurHistory = [...blurHistory];
//         newBlurHistory.pop();
//         setBlurHistory(newBlurHistory);

//         // Redraw the canvas without the last blur
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");
//         ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas

//         // Redraw the image
//         if (image) {
//             ctx.drawImage(image, 0, 0);
//         }

//         // Redraw remaining blurred regions
//         drawPreviousBlurs(ctx);
//     };

//     return (
//         <div className="boxCard">
//             <input type="file" accept="image/*" onChange={handleImageUpload} />
//             <br />
//             <label>
//                 Blur Intensity: {blurIntensity}
//                 <input
//                     type="range"
//                     min="1"
//                     max="20"
//                     value={blurIntensity}
//                     onChange={(e) => setBlurIntensity(Number(e.target.value))}
//                 />
//             </label>
//             <br />
//             <button onClick={undoLastBlur}>Undo Last Blur</button>
//             <canvas
//                 ref={canvasRef}
//                 style={{
//                     border: "1px solid black",
//                     marginTop: "10px",
//                     cursor: "crosshair",
//                 }}
//                 onMouseDown={handleMouseDown}
//                 onMouseMove={handleMouseMove}
//                 onMouseUp={handleMouseUp}
//             />
//         </div>
//     );
// };

// export default MultiBlurCanvas;

//------------------------------------------ working end


import React, { useRef, useState } from "react";

const MultiBlurCanvas = () => {
    const canvasRef = useRef<any>(null); // <-- canvas ref
    const [image, setImage] = useState<any>(null); // <-- image state
    const [isDrawing, setIsDrawing] = useState(false); // <-- drawing state
    const [start, setStart] = useState<any>({ x: 0, y: 0 }); // <-- starting point
    const [current, setCurrent] = useState<any>({ x: 0, y: 0 }); // <-- current point
    const [blurHistory, setBlurHistory] = useState<any[]>([]); // <-- stores history of blurs
    const [blurIntensity, setBlurIntensity] = useState<number>(6); // <-- blur intensity state

    const canvasWidth = 490; // Fixed width for the canvas

    const handleImageUpload = (e: any) => { // <-- handle file upload
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event: any) => { // <-- handle image load
            const img = new Image();
            img.onload = () => {
                setImage(img);

                // Set the canvas size
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                const aspectRatio = img.width / img.height;

                // Set the canvas width to 490px and calculate height
                const canvasHeight = canvasWidth / aspectRatio;

                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                // Draw the image onto the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height); // clear previous content
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleMouseDown = (e: any) => {
        const rect = canvasRef.current.getBoundingClientRect();
        setStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        setIsDrawing(true);
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrent({ x, y });

        if (image) {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // redraw image for each move
        }

        drawPreviousBlurs(ctx); // keep previous blurs
        drawSelectionRect(ctx, start, { x, y });
    };

    const handleMouseUp = () => {
        setIsDrawing(false);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const x = Math.min(start.x, current.x);
        const y = Math.min(start.y, current.y);
        const width = Math.abs(current.x - start.x);
        const height = Math.abs(current.y - start.y);

        if (!image || width === 0 || height === 0) return;

        // Create temp canvas to blur region
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext("2d") as any;

        tempCtx.filter = `blur(${blurIntensity}px)`; // Apply dynamic blur intensity
        tempCtx.drawImage(
            canvas,
            x, y, width, height,
            0, 0, width, height
        );

        const blurred = tempCtx.getImageData(0, 0, width, height);
        ctx.putImageData(blurred, x, y);

        // Save blur history
        setBlurHistory([
            ...blurHistory,
            { x, y, width, height, blurredData: blurred, blurIntensity },
        ]);
    };

    const drawSelectionRect = (ctx: any, start: any, end: any) => {
        const x = start.x;
        const y = start.y;
        const width = end.x - start.x;
        const height = end.y - start.y;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    };

    const drawPreviousBlurs = (ctx: any) => {
        // Draw all previous blurs
        blurHistory.forEach(({ x, y, width, height, blurredData }) => {
            ctx.putImageData(blurredData, x, y);
        });
    };

    const undoLastBlur = () => {
        if (blurHistory.length === 0) return;

        // Remove the last blur
        const newBlurHistory = [...blurHistory];
        newBlurHistory.pop();
        setBlurHistory(newBlurHistory);

        // Redraw the canvas without the last blur
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas

        // Redraw the image
        if (image) {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        }

        // Redraw remaining blurred regions
        drawPreviousBlurs(ctx);
    };

    return (
        <div className="boxCard">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <br />
            <label>
                Blur Intensity: {blurIntensity}
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={blurIntensity}
                    onChange={(e) => setBlurIntensity(Number(e.target.value))}
                />
            </label>
            <br />
            <button onClick={undoLastBlur}>Undo Last Blur</button>
            <canvas
                ref={canvasRef}
                style={{
                    border: "1px solid black",
                    marginTop: "10px",
                    cursor: "crosshair",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
};

export default MultiBlurCanvas;
