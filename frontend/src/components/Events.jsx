import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "./ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "./ui/carousel";
import { Button } from "./ui/button";
import { Calendar, MapPin } from 'lucide-react';

const Events = () => {
    const [eventsData, setEventsData] = useState([]);

    useEffect(() => {
        fetch('/api/events')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setEventsData(data);
            })
            .catch(err => console.error('Failed to fetch events:', err));
    }, []);

    return (
        <section id="events" className="py-20 bg-white">
            <div className="container mx-auto max-w-[1170px] space-y-8 px-5 xl:px-0">
                <h3 className="text-3xl font-bold text-center uppercase text-dark">LATEST EVENTS</h3>

                <Carousel className="w-full">
                    <CarouselContent className="-ml-4">
                        {eventsData.map((event, index) => (
                            <CarouselItem
                                key={index}
                                className="pl-4 md:basis-1/2 lg:basis-1/3"
                            >
                                <Card className="h-[32rem] shadow-lg rounded-xl overflow-hidden border-none flex flex-col">
                                    <CardContent className="flex flex-col p-0 gap-5 h-full relative">
                                        <div className="w-full space-y-4 flex-grow">
                                            <div className="aspect-video relative w-full overflow-hidden">
                                                <img
                                                    src={event.image || "https://via.placeholder.com/400x300"}
                                                    alt={event.title}
                                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-2 right-2 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm uppercase">
                                                    {event.category}
                                                </div>
                                            </div>

                                            <div className="px-5 flex flex-col gap-2">
                                                <h2 className="text-xl font-bold text-dark leading-tight">{event.title}</h2>

                                                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                                                    <Calendar size={14} />
                                                    <span>{event.date}</span>
                                                </div>

                                                <p className="text-sm text-gray-500 text-left line-clamp-4">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>

                                        <a href="#about" className="block w-full">
                                            <Button
                                                className="font-bold w-full bg-primary text-white rounded hover:bg-primaryDark transition-colors"
                                            >
                                                View Details
                                            </Button>
                                        </a>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <div className="hidden xl:block">
                        <CarouselPrevious className="left-[-50px]" />
                        <CarouselNext className="right-[-50px]" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
};

export default Events;
