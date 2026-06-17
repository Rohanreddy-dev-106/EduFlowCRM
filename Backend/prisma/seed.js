import "dotenv/config";
import prisma from "../src/db/prismaClient.js";

const checklistSteps = [
    "School KYC completed",
    "Admin account created",
    "Teachers onboarded",
    "Student data uploaded",
    "Class structure setup",
    "Fee module configured",
    "Attendance module enabled",
    "Timetable created",
    "Training session completed",
    "Go-live confirmation"
];

const seedProspects = [
    {
        name: "Apex International School",
        school: "Apex International School",
        role: "Principal",
        email: "principal@apex.edu",
        phone: "+1-555-0101",
        source: "Conference",
        stage: "Cold"
    },
    {
        name: "Bright Future Academy",
        school: "Bright Future Academy",
        role: "Admissions Head",
        email: "admissions@brightfuture.edu",
        phone: "+1-555-0102",
        source: "Referral",
        stage: "Contacted"
    },
    {
        name: "Cedar Grove High",
        school: "Cedar Grove High",
        role: "IT Coordinator",
        email: "it@cedargrove.edu",
        phone: "+1-555-0103",
        source: "Direct",
        stage: "Demo Booked"
    },
    {
        name: "Dawnview School",
        school: "Dawnview School",
        role: "Vice Principal",
        email: "vp@dawnview.edu",
        phone: "+1-555-0104",
        source: "Website",
        stage: "Demo Done"
    },
    {
        name: "Evergreen Prep",
        school: "Evergreen Prep",
        role: "Operations Manager",
        email: "ops@evergreen.edu",
        phone: "+1-555-0105",
        source: "Partner",
        stage: "Proposal Sent"
    },
    {
        name: "Fountain Valley School",
        school: "Fountain Valley School",
        role: "Principal",
        email: "principal@fountainvalley.edu",
        phone: "+1-555-0106",
        source: "Referral",
        stage: "Pilot Closed"
    },
    {
        name: "Greenfield Academy",
        school: "Greenfield Academy",
        role: "Director",
        email: "director@greenfield.edu",
        phone: "+1-555-0107",
        source: "Conference",
        stage: "Cold"
    },
    {
        name: "Harbor Lights School",
        school: "Harbor Lights School",
        role: "School Admin",
        email: "admin@harborlights.edu",
        phone: "+1-555-0108",
        source: "Direct",
        stage: "Contacted"
    },
    {
        name: "Ivory Ridge College",
        school: "Ivory Ridge College",
        role: "Academic Coordinator",
        email: "academic@ivoryridge.edu",
        phone: "+1-555-0109",
        source: "Website",
        stage: "Demo Booked"
    },
    {
        name: "Juniper Hill School",
        school: "Juniper Hill School",
        role: "Founder",
        email: "founder@juniperhill.edu",
        phone: "+1-555-0110",
        source: "Partner",
        stage: "Pilot Closed"
    }
];

async function main() {
    // Upsert some users to act as owners/admin for seeded prospects
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: { name: 'Admin User', email: 'admin@example.com', password: 'password', role: 'admin' }
    });

    const ownerA = await prisma.user.upsert({
        where: { email: 'owner.a@example.com' },
        update: {},
        create: { name: 'Owner A', email: 'owner.a@example.com', password: 'password', role: 'agent' }
    });

    const ownerB = await prisma.user.upsert({
        where: { email: 'owner.b@example.com' },
        update: {},
        create: { name: 'Owner B', email: 'owner.b@example.com', password: 'password', role: 'agent' }
    });

    const owners = [ownerA, ownerB];

    await prisma.onboardingChecklist.deleteMany();
    await prisma.prospectNote.deleteMany();
    await prisma.prospect.deleteMany();

    for (let i = 0; i < seedProspects.length; i++) {
        const prospect = seedProspects[i];
        const owner = owners[i % owners.length];

        const created = await prisma.prospect.create({
            data: {
                ...prospect,
                ownerId: owner.id,
                lastContactDate: new Date(Date.now() - 2 * 86400000),
                nextFollowUpDate: new Date(Date.now() + 3 * 86400000)
            }
        });

        await prisma.prospectNote.create({
            data: {
                prospectId: created.id,
                content: `Seed note for ${created.name}.`
            }
        });

        if (created.stage === "Pilot Closed") {
            await prisma.onboardingChecklist.createMany({
                data: checklistSteps.map((title, index) => ({
                    prospectId: created.id,
                    stepNumber: index + 1,
                    title,
                    description: title,
                    assignee: "EduFlow Ops",
                    status: "todo",
                    dueDate: new Date(Date.now() + (index + 1) * 86400000)
                })),
                skipDuplicates: true
            });
        }
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
