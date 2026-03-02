const Question = require('../../database/models/Question');

// GET /api/stats
const getStats = async (req, res) => {
    try {
        // Efficient Single-Pass Aggregation for all stats
        const stats = await Question.aggregate([
            {
                $facet: {
                    "counts": [
                        { $group: { _id: "$type", count: { $sum: 1 } } }
                    ],
                    "difficulty": [
                        { $group: { _id: "$difficulty", count: { $sum: 1 } } }
                    ],
                    "topTopics": [
                        { $group: { _id: "$subtopic", count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 }
                    ],
                    "smeStats": [
                        { $group: { _id: "$smeName", count: { $sum: 1 } } },
                        { $sort: { count: -1 } }
                    ]
                }
            }
        ]);

        const result = stats[0];

        // Parse counts
        const mcqCount = result.counts.find(c => c._id === 'mcq')?.count || 0;
        const codingCount = result.counts.find(c => c._id === 'coding')?.count || 0;

        // Parse difficulty
        const diffMap = {};
        result.difficulty.forEach(d => { diffMap[d._id] = d.count; });

        // Separate fetch for recent activity (needs full documents)
        const recentQuestions = await Question.find()
            .sort({ _id: -1 })
            .limit(5)
            .select('subtopic type difficulty createdAt');

        // Total SME Count - Efficiently extracted
        const smeCount = result.smeStats.length;

        res.json({
            mcqCount,
            codingCount,
            totalCount: mcqCount + codingCount,
            difficulty: {
                easy: diffMap.easy || 0,
                medium: diffMap.medium || 0,
                hard: diffMap.hard || 0
            },
            topTopics: result.topTopics,
            recentActivity: recentQuestions,
            smeStats: result.smeStats,
            smeCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getStats };
