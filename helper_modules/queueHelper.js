let queueHelper = {
    'findSocket' : (userID = false, queue = false) => {
        if( !userID || !queue ){
            return false
        }

        let result = false
        queue.forEach((e) => {
            if( e.userID == userID ){
                result = e
            }
        })
        
        return result
    },
    'findMessage' : ( messageID = false, queue = false ) => {
        if( !messageID || !queue ){
            return false
        }

        let result = false
        queue.forEach((e) => {
            if( e.messageID == messageID ){
                result = e
            }
        })
        
        return result
    }
}

module.exports = queueHelper