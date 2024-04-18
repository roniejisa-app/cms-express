const { object } = require('yup');

module.exports = async (req, res, next) => {
    req.validate = async (data, rules = {}) => {
        const schema = object(rules);
        try {
            const body = await schema.validate(data, {
                abortEarly: false
            })
            return body;
        } catch (e) {
            const errors = e.inner.reduce((initial, item) => {
                if(!initial[item.path]){
                    initial[item.path] = item.message;
                }
                return initial;
            }, {});
            req.flash("old", data);
            req.flash("errors", errors);
        }
    }
    const errors = req.flash("errors");

    req.error = errors.length ? errors[0] : {};
    const old = req.flash("old");
    req.old = old.length ? old[0] : {};
    next();
}