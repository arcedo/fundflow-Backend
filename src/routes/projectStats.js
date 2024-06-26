const { Router } = require('express');
const router = Router();

const StatsProjects = require('../models/statsProjects');
const verifyUserLogged = require('../controllers/verifyUserLogged');
const getProjectStats = require('../controllers/getProjectStats');

router.get('/:id/stats/user/', verifyUserLogged, async (req, res) => {
    try {
        const idUser = Number(req.userId);
        const idProject = Number(req.params.id);
        if (Number.isNaN(idUser) || Number.isNaN(idProject)) {
            return res.status(400).send({ message: 'Invalid idUser or idProject', code: 400 });
        }
        const stats = await StatsProjects.findOne({ idUser, idProject });
        if (!stats) {
            return res.status(404).send({ message: 'Stats not found', code: 404 });
        }
        res.status(200).send(stats);
    } catch (error) {
        console.error('Error in /:id/stats/user/:idUser route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.get('/:id/stats', async (req, res) => {
    try {
        const stats = await getProjectStats(Number(req.params.id));
        if (!stats) {
            return res.status(404).send({ message: 'Stats not found' });
        }
        res.status(200).send(stats[0]);
    } catch (error) {
        console.error('Error in /:id/stats route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.post('/:id/stats', verifyUserLogged, async (req, res) => {
    try {
        const { idCategory } = req.body;
        if (!idCategory) {
            return res.status(400).send({ message: 'idCategory are required' });
        }
        const userViewed = await StatsProjects.findOne({ idUser: req.userId, idProject: req.params.id, idCategory });
        if (userViewed) {
            return res.status(200).send({ message: 'User already viewed this project', code: 200 });
        } else {
            const stats = new StatsProjects({
                idUser: req.userId,
                idProject: req.params.id,
                idCategory,
                view: true
            });
            const result = await stats.save();
            res.status(201).send({ result, code: 201 });
        }
    } catch (error) {
        console.error('Error in POST /:id/stats route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.put('/:id/stats/views', verifyUserLogged, async (req, res) => {
    try {
        const stats = await StatsProjects.findOne({ idUser: req.userId, idProject: req.params.id });
        if (!stats) {
            return res.status(404).send({ message: 'Stats not found' });
        }
        stats.view = true;
        const result = await stats.save();
        res.status(200).send(result);
    } catch (err) {
        console.error('Error in PUT /:id/stats/views route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.post('/:id/stats/like', verifyUserLogged, async (req, res) => {
    try {
        const stats = new StatsProjects({
            idUser: req.userId,
            idCategory: req.body.idCategory,
            idProject: req.params.id,
            like: true
        });
        const result = await stats.save();
        res.status(201).send(result);
    } catch (error) {
        console.error('Error in POST /:id/stats/like route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.put('/:id/stats', verifyUserLogged, async (req, res) => {
    try {
        const { evaluation, fund, collaboration, evaluationStatus } = req.body;
        const stats = await StatsProjects.findOne({ idUser: (req.userId), idProject: (req.params.id) });
        if (!stats) {
            return res.status(404).send({ message: 'Stats not found', code: 404 });
        }
        if (evaluation === 'likes') {
            stats.like = evaluationStatus;
            stats.dislike = false;
        } else if (evaluation === 'dislikes') {
            stats.like = false;
            stats.dislike = evaluationStatus;
        }
        if (fund) {
            stats.funded += Number(fund);
        }
        if (collaboration) {
            stats.collaborator = true;
        }
        const result = await stats.save();
        res.status(200).send({ result, code: 200 });
    } catch (error) {
        console.error('Error in PUT /:id/stats route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.get('/stats/percentageViews', async (req, res) => {
    try {
        const result = await StatsProjects.aggregate([
            {
                $group: {
                    _id: "$idCategory",
                    views: { $sum: { $cond: [{ $eq: ["$view", true] }, 1, 0] } }
                }
            },
            {
                $project: {
                    idCategory: "$_id",
                    views: 1,
                    _id: 0
                }
            }
        ]);
        if (result.length > 0) {
            const totalViews = result.map(category => category.views).reduce((acc, curr) => acc + curr, 0);

            let categoriesPercentage = [];
            result.forEach(category => {
                const percentage = (category.views / totalViews) * 100;
                categoriesPercentage.push({
                    idCategory: category.idCategory,
                    percentage: percentage.toFixed(2)
                });
            });
            res.status(200).send(categoriesPercentage);
        } else {
            res.status(404).send({ message: 'No projects found' });
        }
    } catch (error) {
        console.error('Error in /categoryViewPercentage route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

module.exports = router;