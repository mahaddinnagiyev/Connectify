import { Body, Controller, HttpException, InternalServerErrorException, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup-dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('signup')
    async signup(@Body() signupDTO: SignupDTO): Promise<{ success: boolean, message: string, user: any } | HttpException> {
        try {
            return this.authService.signup(signupDTO);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

}
