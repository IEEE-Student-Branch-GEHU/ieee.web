import React, { useState, useEffect } from 'react';
import { Card, CardTitle, CardDescription } from "./ui/card";
import { BsFacebook, BsLinkedin } from "react-icons/bs";
import { Button } from "./ui/button";

const ExecTeam = () => {
    const [teamData, setTeamData] = useState([]);

    // Fallback data in case API fails or is empty, to match the "Chairperson" filtering logic
    // The reference code filters for "chairperson". We should see what our data looks like. 
    // If not fetching, we might want to show all for now?
    // Let's assume we show all fetched members for now, or maybe specific roles if we had them.
    // The reference design shows a grid.

    useEffect(() => {
        fetch('/api/team')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setTeamData(data);
            })
            .catch(err => console.error('Failed to fetch team data:', err));
    }, []);

    return (
        <section id="team" className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-[1170px]">
                <h3 className="text-3xl font-bold text-center uppercase mb-12 text-dark">
                    Meet the Executive Committee
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {teamData.map((member, index) => (
                        <Card
                            key={index}
                            className="flex flex-col items-center overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="aspect-square w-full relative group">
                                <img
                                    src={member.image || "https://via.placeholder.com/300"}
                                    alt={member.name}
                                    className="object-cover w-full h-full bg-gradient-to-b from-blue-500/50 to-blue-900/90"
                                />
                                {/* Overlay could go here if needed */}
                            </div>

                            <div className="text-center my-6 space-y-2 flex-grow px-4">
                                <CardTitle className="text-xl font-bold text-dark">
                                    {member.name}
                                </CardTitle>
                                <CardDescription className="text-primary font-medium">{member.role}</CardDescription>
                            </div>
                            <div className="flex justify-center space-x-5 mb-6">
                                <a href={member.socials?.linkedin || "#"} target="_blank" rel="noopener noreferrer">
                                    <BsLinkedin className="text-xl text-primary hover:text-secondary transition-colors" />
                                </a>
                                <a href={member.socials?.instagram || "#"} target="_blank" rel="noopener noreferrer">
                                    <BsFacebook className="text-xl text-primary hover:text-secondary transition-colors" />
                                </a>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center mt-12">
                    {/* Placeholder for View All functionality if we had pagination */}
                    <Button
                        className="px-8 py-6 bg-primary text-white rounded hover:bg-primaryDark transition-colors duration-300 font-bold tracking-wider"
                    >
                        VIEW ALL MEMBERS
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default ExecTeam;
