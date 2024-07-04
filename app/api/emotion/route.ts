import { HfInference, TextClassificationOutput } from "@huggingface/inference";

//const hf = new HfInference('your access token')
let hf: HfInference;


export async function POST (req: Request, res: Response) {
    // const reqBody = await req.json();
    const {input} = await req.json();// {input:input}
    const inferenceResponse: TextClassificationOutput = await runInference(input);
    // 28 가지의 감정표기
    //console.log('inferenceResponse: ', inferenceResponse);
    const filteredResponse = filterResponses([...inferenceResponse])
    
    return new Response(JSON.stringify({
        inferenceResponse: inferenceResponse,
        filteredResponse: filteredResponse,
    }), {status: 200})
} 

async function runInference(input:string) {
    if (!hf){
        hf = new HfInference(process.env.HF_TOKEN)
    }
    // 모델은 https://huggingface.co/SamLowe/roberta-base-go_emotions 카피해옴
    const modelName = 'SamLowe/roberta-base-go_emotions';
    const inferenceRes = await hf.textClassification({
        model: modelName,
        inputs: input,
    });
    return inferenceRes;
}

function filterResponses(emotions:TextClassificationOutput){
    const filtered = [];
    const emotion0 = emotions.shift();
    filtered.push(emotion0);

    let score = emotion0?.score;
    while (emotions.length > 0 ) {
        const emotionI = emotions.shift();
        if(emotionI?.score! > score!*0.5) {
            filtered.push(emotionI);
            score = emotionI?.score;
        } else {
            break;
        }
    }
    return filtered
}