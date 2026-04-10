import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_URL = 'http://localhost:5001';

async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/signin`, {
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD,
        });
        
        const token = loginRes.data.accessToken;
        console.log('Login successful. Token acquired.');

        console.log('Calling /members endpoint...');
        try {
            const membersRes = await axios.get(`${API_URL}/members?page=1&limit=12`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Success:', JSON.stringify(membersRes.data, null, 2));
        } catch (e: any) {
            console.error('Members Error:', e.response?.status, e.response?.data);
        }
    } catch (e: any) {
        console.error('Login Error:', e.response?.status, e.response?.data);
    }
}

test();
