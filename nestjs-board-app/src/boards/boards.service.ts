import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardRepository } from './board.repository';
import { BoardStatus } from './board-status.enum';
import { User } from '../auth/user.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private boardRepository: BoardRepository,
  ) {}

  // 특정 게시물 조회
  getBoardById(id: number): Promise<Board> {
    return this.boardRepository.getBoardById(id);
  }

  // 게시물 생성
  createBoard(createBoardDto: CreateBoardDto, user: User): Promise<Board> {
    return this.boardRepository.createBoard(createBoardDto, user);
  }

  // 특정 게시물 삭제
  deleteBoard(id: number): Promise<void> {
    return this.boardRepository.deleteBoard(id);
  }

  // 특정 게시물 상태 업데이트
  updateBoardStatus(id: number, status: BoardStatus): Promise<Board> {
    return this.boardRepository.updateBoardStatus(id, status);
  }

  // 게시물 전체 조회
  getAllBoards(user: User): Promise<Board[]> {
    return this.boardRepository.getAllBoards(user);
  }
}
