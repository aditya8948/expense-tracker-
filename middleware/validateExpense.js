const validateExpense = (req, res, next) =>{
    const {amount, description, category} = req.body;

    if(!amount || isNaN(amount) || Number(amount) <= 0){
        return res.status(400).json({message: "Invalid amount!"});
    }

    if(!description) return res.status(400).json({message: "Description is required"});

    if(!category) return res.status(400).json({
        message:"category is required"
    });

    next();
}

module.exports = validateExpense;