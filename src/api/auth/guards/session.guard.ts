import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SessionService } from 'src/api/session/session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const sessionId = request.cookies.sessionId;

    try {
      if (sessionId) {
        console.log(sessionId);

        const session = await this.sessionService.getSession(sessionId);
        console.log(session);

        if (session && !session.userAgent)
          await this.sessionService.updateSession(sessionId, request);

        if (!session || new Date() > session.expire) {
          request.session.regenerate((err) => {
            if (err) {
              throw new InternalServerErrorException(
                "Sessiyani yaratib bo'lmadi",
              );
            }
          });

          response.cookie('sessionId', request.sessionID, {
            httpOnly: true,
            secure: true, // Set to true if your site is using HTTPS
            sameSite: 'None', // Required for cross-site cookies
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
          });

          return true;
        }

        return true;
      }

      console.log(sessionId);
      request.session.regenerate((err) => {
        if (err) {
          throw new InternalServerErrorException("Sessiyani yaratib bo'lmadi");
        }
      });

      response.cookie('sessionId', request.sessionID, {
        httpOnly: true,
        secure: true, // Set to true if your site is using HTTPS
        sameSite: 'None', // Required for cross-site cookies
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      });

      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        "Sessiya bilan bog'liq muammo yuz berdi",
      );
    }
  }
}
