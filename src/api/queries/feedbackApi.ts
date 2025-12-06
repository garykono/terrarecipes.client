import axiosInstance from "../../utils/axiosConfig";

export const createFeedback = async (message: string) => {
    return (
        axiosInstance
            .post(`/feedback`, { message })
            .then(response => {
                return response;
            })
    );
}