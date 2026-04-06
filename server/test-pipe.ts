import 'reflect-metadata';
import { CreateBusinessApplicationDto } from './src/modules/business-directory/dto/business-directory.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

async function test() {
  const payload = {
    name: "Test",
    category: "Tech",
    foundingYear: 2026,
    missionAlignment: "Test",
    locationText: "Earth",
    perkOffer: "10%",
    contactEmail: "test@test.com"
  };
  
  const instance = plainToInstance(CreateBusinessApplicationDto, payload);
  console.log('Instance:', instance);
  
  const errors = await validate(instance);
  if (errors.length > 0) {
    console.log('Errors:', errors.map(e => ({ property: e.property, constraints: e.constraints })));
  } else {
    console.log('Success!');
  }
}
test();
