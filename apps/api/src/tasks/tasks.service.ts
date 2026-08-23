import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  private supabase;

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      this.config.get<string>('SUPABASE_URL')!,
      this.config.get<string>('SUPABASE_ANON_KEY')!,
    );
  }

  async findAll(userId: string) {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('priority_score', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async create(userId: string, dto: any) {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert({ ...dto, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(userId: string, id: string, dto: any) {
    const { data, error } = await this.supabase
      .from('tasks')
      .update(dto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new NotFoundException('Task tidak ditemukan');
    return data;
  }

  async remove(userId: string, id: string) {
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new NotFoundException('Task tidak ditemukan');
    return { message: 'Task berhasil dihapus' };
  }
}