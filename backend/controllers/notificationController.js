const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipientId: req.user._id },
        { recipientRole: req.user.role }
      ]
    }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { recipientId: req.user._id },
          { recipientRole: req.user.role }
        ],
        isRead: false
      },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      $or: [
        { recipientId: req.user._id },
        { recipientRole: req.user.role }
      ],
      isRead: false
    });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
