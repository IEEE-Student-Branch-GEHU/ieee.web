const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Team = require('../models/Team');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = [
    // 2023-2024 Session
    {
        name: "Alice Johnson",
        role: "Chairperson",
        category: "executive",
        year: "2023-2024",
        rank: 1,
        isLead: true,
        email: "alice@example.com",
        bio: "Leading the chapter with vision."
    },
    {
        name: "Bob Smith",
        role: "Vice Chairperson",
        category: "executive",
        year: "2023-2024",
        rank: 2,
        isLead: true,
        email: "bob@example.com",
        bio: "Supporting operations and strategy."
    },
    {
        name: "Charlie Brown",
        role: "Technical Head",
        category: "technical",
        year: "2023-2024",
        rank: 10,
        isLead: false,
        email: "charlie@example.com",
        bio: "Master of bits and bytes."
    },
    {
        name: "Diana Prince",
        role: "Creative Head",
        category: "creative",
        year: "2023-2024",
        rank: 11,
        isLead: false,
        email: "diana@example.com",
        bio: "Crafting visual excellence."
    },
    {
        name: "Evan Wright",
        role: "Active Member",
        category: "member",
        year: "2023-2024",
        rank: 100,
        isLead: false,
        email: "evan@example.com",
        bio: "Dedicated volunteer."
    },
    {
        name: "Fiona Glenn",
        role: "Student Volunteer",
        category: "member",
        year: "2023-2024",
        rank: 101,
        isLead: false,
        email: "fiona@example.com",
        bio: "Helping out with event coordination."
    },
    // 2022-2023 Session
    {
        name: "Past Leader X",
        role: "Chairperson",
        category: "executive",
        year: "2022-2023",
        rank: 1,
        isLead: true,
        email: "past@example.com",
        bio: "Former lead."
    },
    {
        name: "Old Guard Y",
        role: "Treasurer",
        category: "management",
        year: "2022-2023",
        rank: 5,
        isLead: false,
        email: "guardy@example.com",
        bio: "Handled the treasury with precision."
    }
];

const seedDB = async () => {
    if (process.env.NODE_ENV === 'production') {
        console.error('ERROR: Seeding is not allowed in production. Set NODE_ENV to development or test.');
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // Clear existing team data to avoid duplicates for this test
        await Team.deleteMany({});
        console.log("Cleared existing team data.");

        await Team.insertMany(seedData);
        console.log("Seed data inserted successfully!");

        mongoose.connection.close();
    } catch (err) {
        console.error("Error seeding database:", err);
        process.exit(1);
    }
};

seedDB();
