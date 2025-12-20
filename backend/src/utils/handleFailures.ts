type handleFailureType = (
    level : "basic" | "fatal" | "major" ,
    message : string,
    root ?: string
) => void

const handleFailure : handleFailureType  = (level, message, root) => {
    switch(level){
        case "basic":
            console.log("BASIC LOG : ")
            console.log("MESSAGE : ", message)
            if(root) console.log("ROOT : ", root)
            break
        case "major":
            console.log("ERROR : ")
            console.log("MESSAGE : ", message)
            // log into sentry
            if(root) console.log("ROOT : ", root)
            break
        case "fatal":
            // log into sentry
            console.log("FATAL ERROR : ")
            console.log("MESSAGE : ", message)
            if(root) console.log("ROOT : ", root)
            process.exit(1)
            break
        default: 
            console.log("Invalid Failure Call")
    }
}

export default handleFailure