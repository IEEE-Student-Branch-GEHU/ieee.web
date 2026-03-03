import React from "react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card.jsx";
import { FaEye } from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";

// Assets
// Imports removed as chapters are not present

const VisionMission = () => {
    return (
        <section className="py-20 bg-gray-50/50">
            <div className="container mx-auto max-w-[1170px] flex flex-col justify-center items-center px-5 xl:px-0">
                <div className="w-full flex flex-col sm:flex-row justify-center gap-5 ">
                    <Card className="shadow-lg flex-1 bg-white border-none transition-all hover:shadow-xl duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg font-bold text-dark">
                                <TbTargetArrow size={35} className="text-primary" />

                                <div>
                                    OUR <span className="text-primary">MISSION</span>
                                </div>
                            </CardTitle>

                            <CardDescription className="text-sm text-gray-600 leading-relaxed mt-4 space-y-2">
                                <p>To advise the community on ethics policy and concerns.</p>
                                <p>To foster awareness on ethical issues within the technology sector.</p>
                                <p>To promote ethical behavior amongst individuals and organizations in IEEE fields of interest.</p>
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-lg flex-1 bg-white border-none transition-all hover:shadow-xl duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg font-bold text-dark">
                                <FaEye size={35} className="text-secondary" />

                                <div>
                                    OUR <span className="text-secondary">VISION</span>
                                </div>
                            </CardTitle>

                            <CardDescription className="text-sm text-gray-600 leading-relaxed mt-4 space-y-2">
                                <p>A world where engineers and scientists are respected for exemplary ethical behavior.</p>
                                <p>A future driven by the IEEE and its Ethics & Member Conduct Committee.</p>
                                <p>A standard of innovation rooted in integrity and responsibility.</p>
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>


            </div>
        </section>
    );
};
export default VisionMission;
