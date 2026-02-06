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

                            <CardDescription className="text-sm text-gray-600 leading-relaxed mt-4">
                                The IEEE Student Branch of Graphic Era Hill University advises the community on ethics
                                policy and concerns as well as fostering awareness on ethical
                                issues and promoting ethical behaviour amongst individuals and
                                organisations working within the IEEE fields of interest.
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

                            <CardDescription className="text-sm text-gray-600 leading-relaxed mt-4">
                                A world in which engineers and scientists are respected for their
                                exemplary ethical behaviour and the IEEE and its Ethics & Member
                                Conduct Committee are recognized as a major drive in this regard.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>


            </div>
        </section>
    );
};
export default VisionMission;
