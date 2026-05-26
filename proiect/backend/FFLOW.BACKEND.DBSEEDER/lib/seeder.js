import mongoose from 'mongoose';

import { hashPassword } from '../../FFLOW.BACKEND.AUTH/lib/crypto.js';

const { ObjectId } = mongoose.Types;

const iasiLocations = [
    { label: 'Palas Campus', address: 'Strada Palas 7A, Iasi, Romania', latitude: 47.1569, longitude: 27.5903 },
    { label: 'Iulius Mall Iasi', address: 'Bulevardul Tudor Vladimirescu 2, Iasi, Romania', latitude: 47.1617, longitude: 27.5846 },
    { label: 'Copou Garden', address: 'Bulevardul Carol I 11, Iasi, Romania', latitude: 47.1769, longitude: 27.5707 },
    { label: 'Alexandru Cultural Hub', address: 'Strada Sarmisegetuza 18, Iasi, Romania', latitude: 47.1684, longitude: 27.5554 },
    { label: 'Pietonal Stefan cel Mare', address: 'Bulevardul Stefan cel Mare si Sfant 16, Iasi, Romania', latitude: 47.1585, longitude: 27.6014 },
    { label: 'Tatarasi Fitness Studio', address: 'Strada Vasile Lupu 78, Iasi, Romania', latitude: 47.1689, longitude: 27.6237 }
];

const futureEventTitles = [
    'Client planning session',
    'Cloud systems lecture',
    'Product roadmap sync',
    'Morning study block',
    'Gym and recovery session',
    'Design review meeting',
    'Mentoring coffee catch-up'
];

const pastEventTitles = [
    'Team retro in Copou',
    'Distributed systems lab',
    'Quarter budget review',
    'Doctor appointment follow-up',
    'Deep work sprint',
    'Family dinner in town',
    'Reading club meetup'
];

const taskTitles = [
    'Prepare seminar notes',
    'Review backend pull requests',
    'Refactor notifications flow',
    'Buy groceries for the week',
    'Finish expense tracking',
    'Plan weekend route',
    'Write project summary',
    'Update billing checklist'
];

const quickNoteSnippets = [
    'Remember to ask about room availability.',
    'Follow up on the Stripe webhook edge case.',
    'Transit looked slower near Podu Ros this morning.',
    'Move the heavier task block before lunch tomorrow.',
    'Keep Friday evening free for family time.'
];

const premiumActivities = [
    { activityType: 'running', displayName: 'Alergare usoara', minimumDurationMinutes: 35 },
    { activityType: 'fiction', displayName: 'Citit fictiune', minimumDurationMinutes: 30 },
    { activityType: 'park-walk', displayName: 'Plimbare in parc', minimumDurationMinutes: 25 },
    { activityType: 'yoga', displayName: 'Yoga si stretching', minimumDurationMinutes: 30 },
    { activityType: 'cooking', displayName: 'Gatit ceva nou', minimumDurationMinutes: 45 }
];

const eventSlots = [
    { startHour: 8, startMinute: 0, durationMinutes: 55 },
    { startHour: 10, startMinute: 0, durationMinutes: 55 },
    { startHour: 13, startMinute: 30, durationMinutes: 55 },
    { startHour: 16, startMinute: 0, durationMinutes: 60 }
];

const taskSlots = [
    { startHour: 9, startMinute: 5, durationMinutes: 35 },
    { startHour: 11, startMinute: 20, durationMinutes: 40 },
    { startHour: 18, startMinute: 10, durationMinutes: 50 }
];

const seedAccounts = [
    {
        name: 'Andrei Popescu',
        email: 'andrei.popescu@focusflow.local',
        plan: 'free',
        kind: 'free'
    },
    {
        name: 'Bianca Matei',
        email: 'bianca.matei@focusflow.local',
        plan: 'free',
        kind: 'free'
    },
    {
        name: 'Teodora Ilie',
        email: 'teodora.ilie@focusflow.local',
        plan: 'premium',
        kind: 'premium'
    }
];

function collection(name) {
    return mongoose.connection.db.collection(name);
}

function atUtc(date, hours, minutes = 0) {
    const result = new Date(date);
    result.setUTCHours(hours, minutes, 0, 0);
    return result;
}

function startOfUtcDay(date) {
    return atUtc(date, 0, 0);
}

function dateOnlyString(date) {
    return new Date(date).toISOString().slice(0, 10);
}

function plusDays(date, amount) {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + amount);
    return result;
}

function pick(list, index) {
    return list[index % list.length];
}

function endAt(startTime, durationMinutes) {
    return new Date(startTime.getTime() + durationMinutes * 60000);
}

function createUserDocs(now) {
    return seedAccounts.map((account, index) => ({
        _id: new ObjectId(),
        name: account.name,
        email: account.email,
        passwordHash: hashPassword('testpass123'),
        plan: account.plan,
        createdAt: new Date(now.getTime() - (index + 1) * 86400000),
        updatedAt: now
    }));
}

function createSubscriptionDocs(users, now) {
    return users.map((user) => ({
        _id: new ObjectId(),
        owner: user._id,
        status: user.plan === 'premium' ? 'active' : 'free',
        plan: user.plan === 'premium' ? 'monthly' : null,
        selectedPlan: user.plan === 'premium' ? 'monthly' : null,
        renewalDate: user.plan === 'premium' ? plusDays(now, 18) : null,
        stripeCustomerId: user.plan === 'premium' ? `cus_seed_${user._id.toString().slice(-8)}` : null,
        stripeSubscriptionId: user.plan === 'premium' ? `sub_seed_${user._id.toString().slice(-8)}` : null,
        lastCheckoutSessionId: user.plan === 'premium' ? `cs_seed_${user._id.toString().slice(-8)}` : null,
        checkoutUrl: user.plan === 'premium' ? 'https://checkout.stripe.com/c/pay/seeded-premium' : null,
        createdAt: new Date(now.getTime() - 10 * 86400000),
        updatedAt: now
    }));
}

function createAds(now) {
    return [
        {
            _id: new ObjectId(),
            title: 'Reducere coworking in Iasi',
            imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
            targetUrl: 'https://focusflow.local/offers/coworking-iasi',
            placement: 'dashboard_banner',
            active: true,
            createdAt: now,
            updatedAt: now
        },
        {
            _id: new ObjectId(),
            title: 'Abonament fitness de dimineata',
            imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
            targetUrl: 'https://focusflow.local/offers/morning-fitness',
            placement: 'calendar_banner',
            active: true,
            createdAt: now,
            updatedAt: now
        }
    ];
}

function createWakeupTimes() {
    return {
        monday: '06:45',
        tuesday: '06:50',
        wednesday: '06:40',
        thursday: '06:45',
        friday: '07:00',
        saturday: '08:30',
        sunday: '08:45'
    };
}

function createUserFeatureData(user, ads, now, userIndex) {
    const events = [];
    const tasks = [];
    const notifications = [];
    const wakeupOverrides = [];
    const quickNotes = [];
    const focusSessions = [];
    const dayPlans = [];
    const adInteractions = [];

    const startDate = plusDays(startOfUtcDay(now), -30);
    const totalDays = 61;

    for (let offset = 0; offset < totalDays; offset += 1) {
        const day = plusDays(startDate, offset);
        const isPast = day < startOfUtcDay(now);
        const dayActivities = [];

        eventSlots.forEach((slot, slotIndex) => {
            const eventId = new ObjectId();
            const eventTitle = pick(isPast ? pastEventTitles : futureEventTitles, offset * eventSlots.length + slotIndex + userIndex);
            const eventLocation = pick(iasiLocations, offset + slotIndex + userIndex);
            const eventStart = atUtc(day, slot.startHour, slot.startMinute);
            const eventEnd = endAt(eventStart, slot.durationMinutes);

            events.push({
                _id: eventId,
                title: eventTitle,
                description: `Scheduled in Iasi for ${user.name}.`,
                startDate: eventStart,
                endDate: eventEnd,
                location: eventLocation,
                recurrence: null,
                alarm: {
                    enabled: true,
                    minutesBefore: 20,
                    triggerAt: new Date(eventStart.getTime() - 20 * 60000)
                },
                completedAt: isPast && (offset + slotIndex) % 6 !== 0 ? new Date(eventEnd.getTime() + 10 * 60000) : null,
                failedAt: isPast && (offset + slotIndex) % 6 === 0 ? new Date(eventEnd.getTime() + 15 * 60000) : null,
                owner: user._id,
                createdAt: new Date(eventStart.getTime() - 2 * 86400000),
                updatedAt: isPast ? new Date(eventEnd.getTime() + 20 * 60000) : now
            });

            notifications.push({
                _id: new ObjectId(),
                owner: user._id,
                sourceType: 'event',
                sourceId: eventId,
                type: slotIndex % 2 === 0 ? 'event_alarm' : 'time_to_leave',
                title: slotIndex % 2 === 0 ? `Alarm: ${eventTitle}` : `Pleaca spre ${eventLocation.label}`,
                message: slotIndex % 2 === 0
                    ? `Evenimentul ${eventTitle} incepe curand.`
                    : `Timp estimat de plecare pentru ${eventLocation.label}.`,
                scheduledFor: new Date(eventStart.getTime() - (slotIndex % 2 === 0 ? 20 : 45) * 60000),
                dismissedAt: null,
                createdAt: new Date(eventStart.getTime() - 2 * 86400000),
                updatedAt: now
            });

            dayActivities.push({
                title: eventTitle,
                startTime: eventStart,
                endTime: eventEnd,
                activityType: 'event',
                referenceId: eventId
            });
        });

        taskSlots.forEach((slot, slotIndex) => {
            const taskId = new ObjectId();
            const taskStart = atUtc(day, slot.startHour, slot.startMinute);
            const taskEnd = endAt(taskStart, slot.durationMinutes);
            const taskLocation = slotIndex % 2 === 0
                ? {
                    label: 'Acasa',
                    address: 'Strada Lascar Catargi 12, Iasi, Romania',
                    latitude: 47.1704,
                    longitude: 27.5766
                }
                : pick(iasiLocations, offset + slotIndex + userIndex + 2);

            tasks.push({
                _id: taskId,
                title: pick(taskTitles, offset * taskSlots.length + slotIndex + userIndex),
                description: `Daily task block for ${user.name}.`,
                estimatedMinutes: slot.durationMinutes,
                priority: slotIndex === 0 ? 'high' : slotIndex === 1 ? 'medium' : 'low',
                manualOrder: slotIndex + 1,
                date: startOfUtcDay(day),
                startTime: taskStart,
                endTime: taskEnd,
                location: taskLocation,
                completed: isPast && (offset + slotIndex) % 5 !== 0,
                completedAt: isPast && (offset + slotIndex) % 5 !== 0 ? new Date(taskEnd.getTime() + 10 * 60000) : null,
                failedAt: isPast && (offset + slotIndex) % 5 === 0 ? new Date(taskEnd.getTime() + 20 * 60000) : null,
                owner: user._id,
                createdAt: new Date(taskStart.getTime() - 86400000),
                updatedAt: isPast ? new Date(taskEnd.getTime() + 15 * 60000) : now
            });

            dayActivities.push({
                title: pick(taskTitles, offset * taskSlots.length + slotIndex + userIndex),
                startTime: taskStart,
                endTime: taskEnd,
                activityType: 'task',
                referenceId: taskId
            });
        });

        if (isPast) {
            quickNotes.push({
                _id: new ObjectId(),
                owner: user._id,
                text: pick(quickNoteSnippets, offset + userIndex),
                timerDurationSeconds: 900 + (offset % 4) * 300,
                timerLabel: ['15:00', '20:00', '25:00', '30:00'][offset % 4],
                date: startOfUtcDay(day),
                createdAt: atUtc(day, 19, 15),
                updatedAt: atUtc(day, 19, 15)
            });

            focusSessions.push({
                _id: new ObjectId(),
                owner: user._id,
                title: offset % 2 === 0 ? 'Morning focus timer' : 'Deep work block',
                sessionType: offset % 2 === 0 ? 'focus' : 'deep_work',
                startTime: atUtc(day, 11, 0),
                endTime: atUtc(day, 11, 45),
                durationSeconds: 2700,
                source: 'timer',
                createdAt: atUtc(day, 11, 45),
                updatedAt: atUtc(day, 11, 45)
            });
        }

        dayPlans.push({
            _id: new ObjectId(),
            date: startOfUtcDay(day),
            dayHash: `${user._id.toString()}-${dateOnlyString(day)}`,
            activities: dayActivities,
            commutes: dayActivities.slice(0, -1).map((activity, index) => {
                const distance = 2.5 + ((offset + index + userIndex) % 7);
                return {
                    fromActivity: activity.referenceId,
                    toActivity: dayActivities[index + 1].referenceId,
                    distance,
                    walkingTimeEstimation: 12 + ((offset + index) % 4) * 3,
                    walkingRecommended: (offset + index) % 3 !== 0,
                    walkingTimeToLeave: new Date(dayActivities[index + 1].startTime.getTime() - (18 + ((offset + index) % 4) * 3) * 60000),
                    busTimeEstimation: 10 + ((offset + index) % 3) * 4,
                    busRecommended: true,
                    busTimeToLeave: new Date(dayActivities[index + 1].startTime.getTime() - (14 + ((offset + index) % 3) * 4) * 60000),
                    drivingTimeEstimation: 8 + ((offset + index) % 3) * 2,
                    drivingRecommended: (offset + index) % 3 === 0,
                    drivingTimeToLeave: new Date(dayActivities[index + 1].startTime.getTime() - (11 + ((offset + index) % 3) * 2) * 60000)
                };
            }),
            owner: user._id,
            createdAt: new Date(day.getTime() - 86400000),
            updatedAt: now
        });
    }

    for (let weekOffset = -4; weekOffset < 5; weekOffset += 1) {
        const baseDay = plusDays(startOfUtcDay(now), weekOffset * 7 + ((weekOffset + 10 + userIndex) % 4));
        const overrideId = new ObjectId();
        const wakeupTime = ['06:15', '06:30', '06:45', '07:05'][Math.abs(weekOffset) % 4];

        wakeupOverrides.push({
            _id: overrideId,
            owner: user._id,
            date: startOfUtcDay(baseDay),
            wakeupTime,
            note: weekOffset >= 0 ? 'Early class day' : 'Recovery morning',
            createdAt: new Date(baseDay.getTime() - 2 * 86400000),
            updatedAt: now
        });

        notifications.push({
            _id: new ObjectId(),
            owner: user._id,
            sourceType: 'wakeupOverride',
            sourceId: overrideId,
            type: weekOffset >= 0 ? 'wake_up_alarm' : 'go_to_bed',
            title: weekOffset >= 0 ? 'Wake-up override' : 'Go to bed reminder',
            message: weekOffset >= 0 ? `Wake up at ${wakeupTime}` : 'Planifica un somn mai devreme inainte de o zi aglomerata.',
            scheduledFor: weekOffset >= 0
                ? atUtc(baseDay, Number(wakeupTime.split(':')[0]), Number(wakeupTime.split(':')[1]))
                : atUtc(baseDay, 22, 15),
            dismissedAt: null,
            createdAt: new Date(baseDay.getTime() - 86400000),
            updatedAt: now
        });
    }

    if (user.plan === 'free') {
        ads.forEach((ad, adIndex) => {
            adInteractions.push(
                {
                    _id: new ObjectId(),
                    owner: user._id,
                    adId: ad._id.toString(),
                    eventType: 'impression',
                    timestamp: plusDays(now, -3 - adIndex),
                    placement: ad.placement,
                    createdAt: plusDays(now, -3 - adIndex),
                    updatedAt: plusDays(now, -3 - adIndex)
                },
                {
                    _id: new ObjectId(),
                    owner: user._id,
                    adId: ad._id.toString(),
                    eventType: 'click',
                    timestamp: plusDays(now, -2 - adIndex),
                    placement: ad.placement,
                    createdAt: plusDays(now, -2 - adIndex),
                    updatedAt: plusDays(now, -2 - adIndex)
                }
            );
        });
    }

    return {
        events,
        tasks,
        notifications,
        wakeupOverrides,
        quickNotes,
        focusSessions,
        dayPlans,
        adInteractions,
        userPreferences: [
            {
                _id: new ObjectId(),
                user: user._id,
                wakeupTimes: createWakeupTimes(),
                createdAt: new Date(now.getTime() - 20 * 86400000 - userIndex * 3600000),
                updatedAt: now
            }
        ],
        freeTimePreferences: [
            {
                _id: new ObjectId(),
                owner: user._id,
                activities: user.plan === 'premium' ? premiumActivities : premiumActivities.slice(0, 3),
                createdAt: new Date(now.getTime() - 15 * 86400000 - userIndex * 3600000),
                updatedAt: now
            }
        ]
    };
}

async function wipeDatabase() {
    const collections = await mongoose.connection.db.collections();
    const results = [];

    for (const currentCollection of collections) {
        if (currentCollection.collectionName.startsWith('system.')) {
            continue;
        }

        const outcome = await currentCollection.deleteMany({});
        results.push({
            collection: currentCollection.collectionName,
            deletedCount: outcome.deletedCount
        });
    }

    return {
        message: 'Database wiped with deleteMany on every non-system collection.',
        collections: results
    };
}

async function seedDatabase() {
    await wipeDatabase();

    const now = new Date();
    const users = createUserDocs(now);
    const subscriptions = createSubscriptionDocs(users, now);
    const ads = createAds(now);
    const userData = users.map((user, index) => createUserFeatureData(user, ads, now, index));

    const combined = {
        events: userData.flatMap((item) => item.events),
        tasks: userData.flatMap((item) => item.tasks),
        notifications: userData.flatMap((item) => item.notifications),
        wakeupOverrides: userData.flatMap((item) => item.wakeupOverrides),
        quickNotes: userData.flatMap((item) => item.quickNotes),
        focusSessions: userData.flatMap((item) => item.focusSessions),
        dayPlans: userData.flatMap((item) => item.dayPlans),
        userPreferences: userData.flatMap((item) => item.userPreferences),
        freeTimePreferences: userData.flatMap((item) => item.freeTimePreferences),
        adInteractions: userData.flatMap((item) => item.adInteractions)
    };

    await collection('auth.users').insertMany(users);
    await collection('billing.subscriptions').insertMany(subscriptions);
    await collection('advertising.ads').insertMany(ads);
    await collection('calendar.events').insertMany(combined.events);
    await collection('calendar.tasks').insertMany(combined.tasks);
    await collection('calendar.notifications').insertMany(combined.notifications);
    await collection('calendar.wakeupoverrides').insertMany(combined.wakeupOverrides);
    await collection('calendar.quicknotes').insertMany(combined.quickNotes);
    await collection('calendar.focussessions').insertMany(combined.focusSessions);
    await collection('calendar.dayplans').insertMany(combined.dayPlans);
    await collection('calendar.userpreferences').insertMany(combined.userPreferences);
    await collection('recommendations.freeTimePreferences').insertMany(combined.freeTimePreferences);
    await collection('advertising.adInteractions').insertMany(combined.adInteractions);

    return {
        message: 'Database seeded successfully.',
        accounts: seedAccounts.map((account) => ({
            email: account.email,
            plan: account.plan,
            password: 'testpass123'
        })),
        counts: {
            users: users.length,
            subscriptions: subscriptions.length,
            ads: ads.length,
            events: combined.events.length,
            tasks: combined.tasks.length,
            notifications: combined.notifications.length,
            wakeupOverrides: combined.wakeupOverrides.length,
            quickNotes: combined.quickNotes.length,
            focusSessions: combined.focusSessions.length,
            dayPlans: combined.dayPlans.length,
            userPreferences: combined.userPreferences.length,
            freeTimePreferences: combined.freeTimePreferences.length,
            adInteractions: combined.adInteractions.length
        },
        premiumAccount: {
            email: 'teodora.ilie@focusflow.local',
            city: 'Iasi, Romania',
            seededFutureDays: 30,
            seededPastDays: 30,
            eventsPerDayPerUser: 4,
            minimumTasksPerDayPerUser: 3
        }
    };
}

export {
    seedDatabase,
    wipeDatabase
};
