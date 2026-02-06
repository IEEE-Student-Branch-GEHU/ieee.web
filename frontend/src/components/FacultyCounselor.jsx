import React from "react";
import { Card, CardDescription, CardTitle } from "./ui/card";
import { BsLinkedin } from "react-icons/bs";

// Assets
import PlaceholderImage from "../assets/placeholder.png";

const counselorData = [
    {
        name: "Prof. (Dr.) H.N. Nagaraja",
        imageUrl: PlaceholderImage,
        title: "Vice Chancellor GEHU",
        position: "Patron",
    },
    {
        name: "Dr. Chandradeep Bhatt",
        imageUrl: PlaceholderImage,
        title: "Student Branch Counselor",
        position: "Branch Counselor",
        linkedin: "https://www.linkedin.com/in/dr-chandradeep-bhatt-8b64a2b0/",
    },
    // Add more as needed
];

const FacultyCounselor = () => {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto max-w-[1170px] space-y-5 px-5 xl:px-0">
                <h3 className="text-3xl font-bold text-center uppercase mb-12 text-dark">
                    Student Branch Counselors
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
                    {counselorData.map((counsellor, index) => (
                        <Card
                            key={index}
                            className="flex flex-col items-center overflow-hidden border-none shadow-md hover:shadow-lg transition-all"
                        >
                            <div className="aspect-square w-full relative">
                                <img
                                    src={counsellor.imageUrl}
                                    alt={counsellor.name}
                                    className="object-cover w-full h-full absolute inset-0"
                                />
                            </div>
                            <div className="text-center my-6 space-y-1 p-4 flex-grow">
                                <CardTitle className="text-xl font-semibold text-dark">
                                    {counsellor.name}
                                </CardTitle>
                                <CardDescription className="font-medium text-gray-600">{counsellor.title}</CardDescription>
                                <p className="text-sm text-primary">{counsellor.position}</p>
                            </div>

                            {counsellor.linkedin && (
                                <div className="pb-6">
                                    <a href={counsellor.linkedin} target="_blank" rel="noopener noreferrer">
                                        <BsLinkedin className="text-xl text-primary hover:text-secondary transition-colors" />
                                    </a>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FacultyCounselor;
