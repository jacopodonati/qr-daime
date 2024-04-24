const express = require('express');
const router = express.Router();
const User = require('../../models/user');

router.post('/', async (req, res) => {
    if (res.locals.user.permissions.manage_users) {
        try {
            const user = await User.findById(req.body.id);
    
            if (user) {
                user.set('role', req.body.role);
                user.save();
            }

            return res.status(200).json({ user });
        } catch (error) {
            console.error('Error querying database:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(403).send('Operazione non consentita');
    }
});

module.exports = router;
