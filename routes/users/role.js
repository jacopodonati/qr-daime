const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const { getUserPermissions } = require('../../config/permissions');

router.post('/', async (req, res) => {
    const id = req.body.id;
    const role = getUserPermissions(req.session.user.role);

    if (role.manage_users) {
        try {
            const user = await User.findById(id);
    
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
