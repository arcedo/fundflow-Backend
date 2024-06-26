const { Router } = require('express');
const router = Router();
const db = require('../database/mySqlConnection');

const verifyUserLogged = require('../controllers/verifyUserLogged');

const ReviewsProjects = require('../models/reviewsProjects');

router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await ReviewsProjects.find({ idProject: Number(req.params.id) });
        if (!reviews) {
            return res.status(404).send({ message: 'Reviews not found', code: 404 });
        }
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error in /:id/reviews route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.get('/reviewing/byUser/:id', async (req, res) => {
    try {
        const reviews = await ReviewsProjects.find({ idUser: req.params.id });
        if (!reviews) {
            return res.status(404).send({ message: 'Reviews not found', code: 404 });
        }
        res.status(200).json(reviews);
    }
    catch (error) {
        console.error('Error in /byUser/reviewing route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.get('/reviewed/byUser/:id', async (req, res) => {
    try {
        const reviews = await ReviewsProjects.find({ idProjectCreator: req.params.id });
        if (!reviews) {
            return res.status(404).send({ message: 'Reviews not found', code: 404 });
        }
        res.status(200).json(reviews);
    }
    catch (error) {
        console.error('Error in /byUser/reviewed route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.post('/:id/reviews', verifyUserLogged, async (req, res) => {
    try {
        const { body, rating, userUrl, projectName, idCreator, projectUrl } = req.body;
        if (!body || !userUrl || !projectName || !idCreator || !projectUrl) {
            return res.status(400).send({ message: 'Missing required fields', code: 400 });
        }
        const newReview = new ReviewsProjects({
            idUser: req.userId,
            userUrl: userUrl,
            projectName: projectName,
            idProjectCreator: Number(idCreator),
            idProject: Number(req.params.id),
            projectUrl: projectUrl,
            body,
            rating: rating,
        });
        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        console.error('Error in /:id/reviews route:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.delete('/:id/reviews/:idReview', verifyUserLogged, async (req, res) => {
    try {
        const review = await ReviewsProjects.findOne({ _id: req.params.idReview });
        if (!review) {
            return res.status(404).send({ message: 'Review not found', code: 404 });
        }
        if (review.idUser !== req.userId) {
            return res.status(403).send({ message: 'Forbidden', code: 403 });
        }
        await ReviewsProjects.deleteOne({ _id: req.params.idReview });
        res.status(200).json({ message: 'Review deleted', code: 200 });
    } catch (error) {
        console.error('Error in DELETE /:id/reviews/:idReview route:', error);
        res.status(500).send({ message: 'Internal Server Error', code: 500 });
    }
});

module.exports = router;