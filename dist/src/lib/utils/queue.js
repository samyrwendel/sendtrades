/**
 * Implementação de uma fila FIFO (First In First Out)
 */
export class Queue {
    constructor() {
        this.items = [];
    }
    /**
     * Adiciona um item ao final da fila
     */
    enqueue(item) {
        this.items.push(item);
    }
    /**
     * Remove e retorna o primeiro item da fila
     */
    dequeue() {
        return this.items.shift();
    }
    /**
     * Retorna o primeiro item da fila sem removê-lo
     */
    peek() {
        return this.items[0];
    }
    /**
     * Verifica se a fila está vazia
     */
    isEmpty() {
        return this.items.length === 0;
    }
    /**
     * Retorna o tamanho atual da fila
     */
    size() {
        return this.items.length;
    }
    /**
     * Limpa todos os itens da fila
     */
    clear() {
        this.items = [];
    }
    /**
     * Retorna uma cópia do array de itens
     */
    toArray() {
        return [...this.items];
    }
}
