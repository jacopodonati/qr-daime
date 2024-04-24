const express = require('express');
const router = express.Router();
const User = require('../../models/user');

router.get('/:id', async (req, res) => {
    if (res.locals.user.permissions.manage_users) {
        try {
            const user = await User.findById(req.params.id);
    
            if (user) {
                user.set('deleted', !user.deleted);
                user.save();
            }

            res.redirect('/manage/users/list');
        } catch (error) {
            console.error('Error querying database:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(403).send('Operazione non consentita');
    }
});

module.exports = router;
