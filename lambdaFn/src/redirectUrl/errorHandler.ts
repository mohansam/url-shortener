interface ErrorProps{
    StatusCode:number,
    body:string,    
}

export enum ErrorType{
    Error_In_400_Range = 'Error_In_400_Range',
    Error_In_500_Range='Error_In_500_Range'
}
export const generateError = (errProps: ErrorProps,errorType:ErrorType) => {
    let error = new Error(JSON.stringify(errProps));
    error.name = errorType
    return error;
};

export const handleError = (err: Error): {} => {
    if (err.name.includes('Error_In_400_Range'))
    {
        let errorProps = JSON.parse(err.message);
        return { statusCode: errorProps.StatusCode, body: errorProps.body };
        
    } else {
        console.log(err.message);
        return { statusCode: 500, body: 'something broke' };
    }    
};
