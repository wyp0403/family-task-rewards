import pygame
import time
import random

# 初始化pygame
pygame.init()

# 定义颜色
white = (255, 255, 255)
black = (0, 0, 0)
red = (255, 0, 0)
green = (0, 255, 0)
blue = (0, 0, 255)

# 设置游戏窗口
width = 800
height = 600
display = pygame.display.set_mode((width, height))
pygame.display.set_caption('贪吃蛇游戏')

# 设置游戏时钟
clock = pygame.time.Clock()

# 设置蛇的大小和速度
snake_block = 20
snake_speed = 15

# 设置字体
font_style = pygame.font.SysFont(None, 50)
score_font = pygame.font.SysFont(None, 35)

# 显示分数
def show_score(score):
    value = score_font.render("得分: " + str(score), True, black)
    display.blit(value, [10, 10])

# 绘制蛇
def draw_snake(snake_block, snake_list):
    for x in snake_list:
        pygame.draw.rect(display, green, [x[0], x[1], snake_block, snake_block])

# 显示消息
def message(msg, color):
    mesg = font_style.render(msg, True, color)
    display.blit(mesg, [width / 6, height / 3])

# 游戏主循环
def game_loop():
    game_over = False
    game_close = False

    # 蛇的初始位置
    x1 = width / 2
    y1 = height / 2

    # 蛇的移动方向
    x1_change = 0
    y1_change = 0

    # 蛇身
    snake_list = []
    length_of_snake = 1

    # 食物的位置
    foodx = round(random.randrange(0, width - snake_block) / snake_block) * snake_block
    foody = round(random.randrange(0, height - snake_block) / snake_block) * snake_block

    while not game_over:

        while game_close:
            display.fill(white)
            message("游戏结束! 按Q退出或C重新开始", red)
            show_score(length_of_snake - 1)
            pygame.display.update()

            for event in pygame.event.get():
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_q:
                        game_over = True
                        game_close = False
                    if event.key == pygame.K_c:
                        game_loop()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                game_over = True
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    x1_change = -snake_block
                    y1_change = 0
                elif event.key == pygame.K_RIGHT:
                    x1_change = snake_block
                    y1_change = 0
                elif event.key == pygame.K_UP:
                    y1_change = -snake_block
                    x1_change = 0
                elif event.key == pygame.K_DOWN:
                    y1_change = snake_block
                    x1_change = 0

        # 检查是否撞墙
        if x1 >= width or x1 < 0 or y1 >= height or y1 < 0:
            game_close = True

        # 更新蛇的位置
        x1 += x1_change
        y1 += y1_change
        
        # 绘制游戏界面
        display.fill(white)
        pygame.draw.rect(display, red, [foodx, foody, snake_block, snake_block])
        
        # 更新蛇身
        snake_head = []
        snake_head.append(x1)
        snake_head.append(y1)
        snake_list.append(snake_head)
        
        # 如果蛇身超过长度，删除多余部分
        if len(snake_list) > length_of_snake:
            del snake_list[0]

        # 检查是否撞到自己
        for x in snake_list[:-1]:
            if x == snake_head:
                game_close = True

        # 绘制蛇和分数
        draw_snake(snake_block, snake_list)
        show_score(length_of_snake - 1)
        
        pygame.display.update()

        # 检查是否吃到食物
        if x1 == foodx and y1 == foody:
            foodx = round(random.randrange(0, width - snake_block) / snake_block) * snake_block
            foody = round(random.randrange(0, height - snake_block) / snake_block) * snake_block
            length_of_snake += 1

        # 控制游戏速度
        clock.tick(snake_speed)

    # 退出pygame
    pygame.quit()
    quit()

# 启动游戏
game_loop()