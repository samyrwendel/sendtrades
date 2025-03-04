/**
 * Implementação de uma fila FIFO (First In First Out)
 */
export class Queue<T> {
  private items: T[] = [];

  /**
   * Adiciona um item ao final da fila
   */
  enqueue(item: T): void {
    this.items.push(item);
  }

  /**
   * Remove e retorna o primeiro item da fila
   */
  dequeue(): T | undefined {
    return this.items.shift();
  }

  /**
   * Retorna o primeiro item da fila sem removê-lo
   */
  peek(): T | undefined {
    return this.items[0];
  }

  /**
   * Verifica se a fila está vazia
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Retorna o tamanho atual da fila
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Limpa todos os itens da fila
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Retorna uma cópia do array de itens
   */
  toArray(): T[] {
    return [...this.items];
  }
} 