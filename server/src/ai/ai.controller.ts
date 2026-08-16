import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('diagnostics')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  diagnose() {
    return this.ai.diagnose();
  }

  @Get('conversations')
  list(@CurrentUser() user: JwtPayload) {
    return this.ai.listConversations(user);
  }

  @Get('conversations/:id')
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.ai.getConversation(user, id);
  }

  @Post('chat')
  async chat(@CurrentUser() user: JwtPayload, @Body() dto: ChatDto, @Res() response: Response) {
    const { result, conversationId } = await this.ai.stream(user, dto);
    response.status(200);
    response.setHeader('content-type', 'text/plain; charset=utf-8');
    response.setHeader('x-conversation-id', conversationId);
    let streamed = false;
    try {
      for await (const chunk of result.textStream) {
        streamed = true;
        response.write(chunk);
      }
    } catch {
      response.write('The configured AI provider rejected the request. Check the provider URL, API key, model ID, and required headers.');
      streamed = true;
    }
    if (!streamed) {
      response.write('The AI provider returned no response. Check that the selected model supports OpenAI-compatible chat completions and streaming.');
    }
    response.end();
  }
}
